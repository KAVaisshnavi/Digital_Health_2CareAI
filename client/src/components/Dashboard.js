import React from 'react';
import { useNavigate } from 'react-router-dom';
import VitalsChart from './VitalsChart';
import UploadReport from './UploadReport';
import ReportsList from './ReportsList';
import ShareAccess from './ShareAccess';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div>
            <nav>
                <ul>
                    <li><strong>Health Wallet</strong></li>
                    <li>Welcome, {user.username} <span style={{ fontSize: '0.8em', color: '#666' }}>({user.role})</span></li>
                    <li><button onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'red' }}>Logout</button></li>
                </ul>
            </nav>
            <div className="container">

                <div className="card">
                    <h3>My Vitals</h3>
                    <VitalsChart />
                </div>

                {user.role === 'owner' && (
                    <>
                        <div className="card" id="upload-section">
                            <h3>Upload Report</h3>
                            <UploadReport />
                        </div>

                        <div className="card">
                            <h3>Share Access</h3>
                            <ShareAccess />
                        </div>
                    </>
                )}

                <div className="card">
                    <h3>My Reports</h3>
                    <ReportsList />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
