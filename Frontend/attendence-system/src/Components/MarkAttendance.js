import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const MarkAttendance = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [message, setMessage] = useState(''); // State for showing the result message
  const webcamRef = useRef(null);

  // Capture image function
  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image); // set captured image
  }, [webcamRef]);

  // Convert dataURL to Blob (needed for sending image to the backend)
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Reset for re-capture
  const recapture = () => {
    setImageSrc(null); // reset captured image
  };

  // Handle form submission and send image to API for attendance marking
  const handleMarkAttendance = async () => {
    if (!imageSrc) {
      alert('Please capture an image first.');
      return;
    }

    const formData = new FormData();
    
    // Convert the image to Blob before sending
    const imageBlob = dataURLtoBlob(imageSrc);
    formData.append('image', imageBlob, 'attendance-image.jpg'); // File name

    try {
      const response = await axios.post('http://localhost:2000/mark_attendance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message); // Set the result message from the server
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>

      {/* Show webcam or captured image */}
      {imageSrc ? (
        <div>
          <div className='CameraBox'>
            <img src={imageSrc} alt="Captured" />
          </div>
          <div>
            <button onClick={recapture}>Re-Capture</button>
          </div>
        </div>
      ) : (
        <div>
          <div className='CameraBox'>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="30%"
            />
          </div>
          <div>
            <button onClick={capture}>Capture</button>
          </div>
        </div>
      )}

      {/* Mark Attendance button */}
      <div>
        <button onClick={handleMarkAttendance}>Mark Attendance</button>
      </div>

      {/* Display result message */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default MarkAttendance;
