// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'User is not logged in' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // Cập nhật lastSeenAt
        await User.update({ lastSeenAt: new Date() }, { where: { userId: decoded.userId } });
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };