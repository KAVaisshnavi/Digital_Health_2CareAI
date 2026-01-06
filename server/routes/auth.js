const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Register
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

    // Default to 'owner' if not specified
    const userRole = role === 'viewer' ? 'viewer' : 'owner';
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, userRole], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            return res.status(500).json({ message: 'Error registering user' });
        }
        const token = jwt.sign({ id: this.lastID, role: userRole }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ auth: true, token, user: { id: this.lastID, username, role: userRole } });
    });
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ auth: false, token: null, message: 'Invalid Password' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ auth: true, token, user: { id: user.id, username, role: user.role } });
    });
});

module.exports = router;
