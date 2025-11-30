const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Express middleware to verify JWT tokens and attach user payload to req.user
 * If `adminOnly` query parameter is set (default false), middleware checks for role === 'admin'
 */
module.exports = (options = {}) => {
  const { adminOnly = true } = options;
  return (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      if (adminOnly && payload.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: admin only' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};
