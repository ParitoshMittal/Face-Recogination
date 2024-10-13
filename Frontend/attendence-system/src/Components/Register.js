import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const Register = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [message, setMessage] = useState(''); // State for showing message
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

  // Handle form submission and send data to API
  const handleSubmit = async () => {
    if (!name || !enrollment || !imageSrc) {
      alert('Please provide all details and capture an image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('enrollment_no', enrollment);

    // Convert the image to Blob before sending
    const imageBlob = dataURLtoBlob(imageSrc);
    formData.append('image', imageBlob, 'captured-image.jpg'); // File name

    try {
      const response = await axios.post('http://localhost:2000/register_person', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message); // Set the response message
    } catch (error) {
      console.error('Error registering:', error);
      setMessage(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>

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

      {/* Form fields */}
      <div>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter Enrollment Number"
          value={enrollment}
          onChange={(e) => setEnrollment(e.target.value)}
        />
      </div>

      {/* Register button */}
      <button onClick={handleSubmit}>Register</button>

      {/* Display message */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
