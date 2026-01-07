import React, { useState } from 'react';
import api from '../services/api';

const UploadReport = () => {
    const [file, setFile] = useState(null);
    const [reportType, setReportType] = useState('Blood Test');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [vitals, setVitals] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('report_type', reportType);
        formData.append('date', date);
        formData.append('vitals', vitals);

        try {
            await api.post('/reports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Report uploaded successfully');
            setFile(null);
            setVitals('');
            // Ideally refresh list
        } catch (err) {
            console.error(err);
            alert('Error uploading report: ' + (err.response?.data?.message || err.message || 'Server error'));
        }
    };

    return (
        <form onSubmit={handleUpload}>
            <input type="file" onChange={e => setFile(e.target.files[0])} accept="application/pdf,image/*" required />

            <select value={reportType} onChange={e => setReportType(e.target.value)}>
                <option>Blood Test</option>
                <option>X-Ray</option>
                <option>MRI</option>
                <option>Prescription</option>
                <option>Other</option>
            </select>

            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

            <input
                type="text"
                placeholder="Associated Vitals (e.g. {BP: 120/80})"
                value={vitals}
                onChange={e => setVitals(e.target.value)}
            />

            <button className="btn" type="submit">Upload</button>
        </form>
    );
};

export default UploadReport;
