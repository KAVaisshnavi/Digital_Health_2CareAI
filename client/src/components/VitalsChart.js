import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const VitalsChart = () => {
    const [vitals, setVitals] = useState([]);
    const [type, setType] = useState('BP'); // BP, Sugar, Heart Rate
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch vitals
    const fetchVitals = async () => {
        try {
            const res = await api.get('/vitals');
            setVitals(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, []);

    const handleAddVital = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vitals', { type, value, date });
            setValue('');
            fetchVitals();
        } catch (err) {
            alert('Error adding vital');
        }
    };

    // Filter data for chart based on selected type (simple viz)
    // Or display all? Let's display lines for different types if possible or separate charts.
    // Grouping by date might be complex for simple chart, so let's just filter by 'type' for simplicity as requested "Filter vitals by date range" (backend) 
    // UI request: "Display trends using Recharts".

    // Let's create a derived dataset for the chart. 
    // We can show all types on one chart if they share the scale, but BP (120) and Sugar (100) and HR (70) are similar scale.
    // But strictly, we should separate or color code.

    // Let's optimize the chart data:
    // We need to merge readings by date? Or just plot points?
    // Simple scatter/line plot by date.

    return (
        <div>
            <form onSubmit={handleAddVital} style={{ marginBottom: '20px' }}>
                <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100px' }}>
                    <option value="BP">BP (Sys)</option>
                    <option value="Sugar">Sugar</option>
                    <option value="HeartRate">Heart Rate</option>
                </select>
                <input
                    type="number"
                    placeholder="Value"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    style={{ width: '100px', marginLeft: '10px' }}
                    required
                />
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{ width: '150px', marginLeft: '10px' }}
                    required
                />
                <button type="submit" className="btn" style={{ marginLeft: '10px' }}>Add</button>
            </form>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={vitals}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {/* We will plot all 3 types if they exist, filtering the data prop or using `connectNulls`? 
                Actually, Recharts expects an array of objects where keys are the lines. 
                Our data is flat: [{type: 'BP', value: 120, date: '...'}, ...].
                We need to transform it or use multiple lines with data filters.
                Simplest: Line filters.
            */}
                        <Line type="monotone" dataKey="value" data={vitals.filter(v => v.type === 'BP')} name="BP" stroke="#8884d8" />
                        <Line type="monotone" dataKey="value" data={vitals.filter(v => v.type === 'Sugar')} name="Sugar" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="value" data={vitals.filter(v => v.type === 'HeartRate')} name="Heart Rate" stroke="#ff7300" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default VitalsChart;
