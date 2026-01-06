const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Add Vital
router.post('/', verifyToken, (req, res) => {
    const { type, value, date } = req.body;
    const userId = req.userId;

    db.run(`INSERT INTO vitals (user_id, type, value, date) VALUES (?, ?, ?, ?)`,
        [userId, type, value, date],
        function (err) {
            if (err) return res.status(500).json({ message: 'Error saving vital' });
            res.status(201).json({ message: 'Vital added', id: this.lastID });
        }
    );
});

// Get Vitals (with optional date range filter)
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;
    const { from, to } = req.query;

    let query = `SELECT * FROM vitals WHERE user_id = ?`;
    const params = [userId];

    if (from) {
        query += ` AND date >= ?`;
        params.push(from);
    }
    if (to) {
        query += ` AND date <= ?`;
        params.push(to);
    }

    query += ` ORDER BY date ASC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error retrieving vitals' });
        res.status(200).json(rows);
    });
});

module.exports = router;
