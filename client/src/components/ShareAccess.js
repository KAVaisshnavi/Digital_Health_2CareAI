import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ShareAccess = () => {
    const [reports, setReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            const res = await api.get('/reports');
            setReports(res.data);
        };
        fetchReports();
    }, []);

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            await api.post('/share', { report_id: selectedReportId, usernameToShareWith: username });
            alert(`Shared successfully with ${username}`);
            setUsername('');
        } catch (err) {
            alert('Error sharing: ' + (err.response?.data?.message || 'Server error'));
        }
    };

    return (
        <form onSubmit={handleShare}>
            <p>Share a report with another user (by username).</p>
            {reports.length === 0 ? (
                <p style={{ color: 'gray' }}>
                    You have no reports to share.
                    <a href="#upload-section" onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById('upload-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}> Upload one first</a>.
                </p>
            ) : (
                <select value={selectedReportId} onChange={e => setSelectedReportId(e.target.value)} required>
                    <option value="">Select Report</option>
                    {reports.map(r => (
                        <option key={r.id} value={r.id}>{r.report_type} - {r.date}</option>
                    ))}
                </select>
            )}
            <input
                type="text"
                placeholder="Username to share with"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={reports.length === 0}
            />
            <button className="btn" type="submit" disabled={reports.length === 0}>Share Details</button>
        </form>
    );
};

export default ShareAccess;
