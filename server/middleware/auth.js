const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Expecting format "Bearer <token>"
    const bearerToken = token.split(' ')[1];

    if (!bearerToken) {
        return res.status(403).json({ message: 'Malformed token' });
    }

    jwt.verify(bearerToken, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role; // Attach role to request
        next();
    });
};

module.exports = verifyToken;
