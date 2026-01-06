const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// File Upload Strategy (Local Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Upload Report
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
    if (req.userRole !== 'owner') {
        return res.status(403).json({ message: 'Only Owners can upload reports' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { report_type, date, vitals } = req.body;
    const userId = req.userId;
    const filename = req.file.filename;

    db.run(`INSERT INTO reports (user_id, filename, report_type, date, vitals) VALUES (?, ?, ?, ?, ?)`,
        [userId, filename, report_type, date, vitals],
        function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error saving report metadata' });
            }
            res.status(201).json({ message: 'Report uploaded successfully', reportId: this.lastID });
        }
    );
});

// Get All Reports (for logged in user)
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;
    db.all(`SELECT * FROM reports WHERE user_id = ? ORDER BY date DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error retrieving reports' });
        res.status(200).json(rows);
    });
});

// Get Single Report (Download/View)
router.get('/:id', verifyToken, (req, res) => {
    const reportId = req.params.id;
    const userId = req.userId;

    // Check ownership or shared access
    const query = `
    SELECT r.* 
    FROM reports r 
    LEFT JOIN shares s ON r.id = s.report_id 
    WHERE r.id = ? AND (r.user_id = ? OR s.shared_with_user_id = ?)
  `;

    db.get(query, [reportId, userId, userId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Error retrieving report' });
        if (!row) return res.status(403).json({ message: 'Access denied or report not found' });

        // Return file URL or metadata. For simplicity, returning metadata + statis URL constructed on client
        res.status(200).json(row);
    });
});

// Delete Report (Owner only)
router.delete('/:id', verifyToken, (req, res) => {
    const reportId = req.params.id;
    const userId = req.userId;
    const fs = require('fs');

    db.get(`SELECT * FROM reports WHERE id = ? AND user_id = ?`, [reportId, userId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (!row) return res.status(403).json({ message: 'Not authorized to delete this report' });

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../uploads/', row.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from DB
        db.run(`DELETE FROM shares WHERE report_id = ?`, [reportId], (err) => {
            db.run(`DELETE FROM reports WHERE id = ?`, [reportId], (err) => {
                if (err) return res.status(500).json({ message: 'Error deleting report' });
                res.status(200).json({ message: 'Report deleted' });
            });
        });
    });
});

module.exports = router;
