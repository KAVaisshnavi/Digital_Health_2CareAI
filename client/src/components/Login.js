import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            if (response.data.auth) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            } else {
                alert('Login failed');
            }
        } catch (error) {
            alert('Login error: ' + (error.response?.data?.message || 'Server error'));
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <div className="card">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn" type="submit" style={{ width: '100%' }}>Login</button>
                </form>
                <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
        </div>
    );
};

export default Login;
