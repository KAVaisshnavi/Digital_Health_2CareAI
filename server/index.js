const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes placeholders (will require files later)
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const vitalRoutes = require('./routes/vitals');
const shareRoutes = require('./routes/shares');

app.use('/api', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/share', shareRoutes);

app.get('/', (req, res) => {
    res.send('Digital Health Wallet API Running');
});

// Create uploads folder if not exists (programmatically or ensure it exists)
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
