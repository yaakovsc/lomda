const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
      res.status(429).json(options.message);
    },
  });

// General API limiter
const apiLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  'בוצעו יותר מדי בקשות. נסה שוב מאוחר יותר.'
);

// Strict limiter for auth endpoints
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  10,             // 10 attempts
  'יותר מדי ניסיונות כניסה. נסה שוב בעוד 15 דקות.'
);

// Password reset limiter
const passwordResetLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'יותר מדי בקשות לאיפוס סיסמה. נסה שוב בעוד שעה.'
);

module.exports = { apiLimiter, authLimiter, passwordResetLimiter };
