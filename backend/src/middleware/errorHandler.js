const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
  });

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'שגיאת אימות נתונים',
      details: err.errors.map((e) => e.message),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'הרשומה כבר קיימת במערכת' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'טוקן לא תקין' });
  }

  // Generic error - don't leak internals
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'אירעה שגיאה פנימית. אנא נסה שוב.';

  res.status(status).json({ error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'הנתיב המבוקש אינו קיים' });
};

module.exports = { errorHandler, notFound };
