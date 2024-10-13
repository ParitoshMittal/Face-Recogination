import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Components/Register';
import MarkAttendance from './Components/MarkAttendance';
import AttendanceList from './Components/AttendanceList'; // Import AttendanceList component

const App = () => {
    return (
        <Router>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h1>Face Recognition Attendance System</h1>
                <nav>
                    <Link to="/mark-attendance" style={{ margin: '10px' }}>Mark Attendance</Link>
                    <Link to="/register" style={{ margin: '10px' }}>Register</Link>
                    <Link to="/attendance-list" style={{ margin: '10px' }}>Attendance List</Link>
                </nav>
                <Routes>
                    <Route path="/mark-attendance" element={<MarkAttendance />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/attendance-list" element={<AttendanceList />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
