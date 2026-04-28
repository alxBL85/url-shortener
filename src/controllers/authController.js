const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, addUser } = require('../models/userModel');
const { JWT_SECRET, tokenBlacklist } = require('../middlewares/authMiddleware');

async function postRegister(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        const newUser = addUser({ username, email, password });
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function postLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = findUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}

async function postLogout(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Authorization token required to logout' });
    }

    tokenBlacklist.add(token);
    res.json({ message: 'Logout successful' });
}

async function postRefreshToken(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Authorization token required to refresh' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const newToken = jwt.sign({ userId: decoded.userId, username: decoded.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = {
    postRegister,
    postLogin,
    postLogout,
    postRefreshToken,
};