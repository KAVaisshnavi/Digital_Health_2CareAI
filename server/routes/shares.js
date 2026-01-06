const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Share Report
router.post('/', verifyToken, (req, res) => {
    if (req.userRole !== 'owner') {
        return res.status(403).json({ message: 'Only Owners can share reports' });
    }
    const { report_id, usernameToShareWith } = req.body;
    const ownerId = req.userId;

    // verify ownership
    db.get(`SELECT * FROM reports WHERE id = ? AND user_id = ?`, [report_id, ownerId], (err, report) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (!report) return res.status(403).json({ message: 'You do not own this report' });

        // get user id to share with
        db.get(`SELECT id FROM users WHERE username = ?`, [usernameToShareWith], (err, user) => {
            if (err || !user) return res.status(404).json({ message: 'User to share with not found' });

            const sharedWithId = user.id;

            db.run(`INSERT INTO shares (report_id, shared_with_user_id, role) VALUES (?, ?, 'viewer')`,
                [report_id, sharedWithId],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Error sharing report' });
                    res.status(200).json({ message: `Report shared with ${usernameToShareWith}` });
                }
            );
        });
    });
});

// Get Shared With Me
router.get('/shared-with-me', verifyToken, (req, res) => {
    const userId = req.userId;
    const query = `
        SELECT r.*, s.role, u.username as owner
        FROM reports r
        JOIN shares s ON r.id = s.report_id
        JOIN users u ON r.user_id = u.id
        WHERE s.shared_with_user_id = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error loading shared reports' });
        res.status(200).json(rows);
    });
});

module.exports = router;
