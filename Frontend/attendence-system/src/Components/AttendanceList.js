import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceList = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch attendance list from the API when the component loads
  useEffect(() => {
    const fetchAttendanceList = async () => {
      try {
        const response = await axios.get('http://localhost:2000/attendance_list');
        setAttendanceList(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch attendance data.');
        setLoading(false);
      }
    };

    fetchAttendanceList();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Attendance List</h2>
      {loading ? (
        <p>Loading attendance list...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <table style={{ borderCollapse: 'collapse', width: '50%', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Enrollment Number</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.enrollment}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.date_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
