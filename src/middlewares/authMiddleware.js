const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ??  'fake-jwt-secret'; // Cambia esto por una variable de entorno en producción

const tokenBlacklist = new Set(); // Tokens JWT revocados por logout

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        if (tokenBlacklist.has(token)) {
            return res.status(403).json({ error: 'Token has been revoked' });
        }

        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken,
    tokenBlacklist,
    JWT_SECRET
};