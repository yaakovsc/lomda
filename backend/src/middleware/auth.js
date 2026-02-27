const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'גישה נדחתה - נדרשת אימות' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { ip: req.ip, path: req.path });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'פג תוקף הסשן - נא להתחבר מחדש', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'טוקן לא תקין' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', { userId: req.user?.id, path: req.path });
    return res.status(403).json({ error: 'גישה מוגבלת - הרשאות מנהל נדרשות' });
  }
  next();
};

const requireEmployee = (req, res, next) => {
  if (!req.user || !['employee', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'גישה נדחתה' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, requireEmployee };
