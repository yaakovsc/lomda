const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
const logger = require('../config/logger');
const emailService = require('../services/emailService');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.scope('withPassword').findOne({ where: { email: email.toLowerCase() } });

      if (!user || !user.isActive) {
        // Constant-time response to prevent user enumeration
        await bcrypt.compare(password, '$2a$12$invalidhashfortimingattackprevention');
        logger.warn('Failed login attempt', { email, ip: req.ip });
        return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        logger.warn('Failed login - wrong password', { userId: user.id, ip: req.ip });
        return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
      }

      // Update last login
      await user.update({
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      });

      const token = generateToken(user);
      logger.audit('USER_LOGIN', user.id, { ip: req.ip });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          role: user.role,
          trainingCompletedAt: user.trainingCompletedAt,
          examCompletedAt: user.examCompletedAt,
          examScore: user.examScore,
          examPassed: user.examPassed,
          examLockedByAdmin: user.examLockedByAdmin,
          trainingSlideProgress: user.trainingSlideProgress,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.scope('withPassword').findByPk(req.user.id);
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(400).json({ error: 'הסיסמה הנוכחית שגויה' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'הסיסמה חייבת להכיל לפחות 8 תווים' });
      }

      const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
      await user.update({ passwordHash: hash });

      logger.audit('PASSWORD_CHANGED', user.id, { ip: req.ip });
      res.json({ message: 'הסיסמה שונתה בהצלחה' });
    } catch (err) {
      next(err);
    }
  },

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email: email.toLowerCase() } });

      // Always return success to prevent enumeration
      if (!user) {
        return res.json({ message: 'אם האימייל קיים במערכת, נשלח קישור לאיפוס סיסמה' });
      }

      const token = uuidv4();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({ resetToken: token, resetTokenExpiry: expiry });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await emailService.sendPasswordReset(user, resetUrl);

      logger.audit('PASSWORD_RESET_REQUESTED', user.id, { ip: req.ip });
      res.json({ message: 'אם האימייל קיים במערכת, נשלח קישור לאיפוס סיסמה' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const user = await User.scope('withPassword').findOne({ where: { resetToken: token } });

      if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ error: 'הקישור פג תוקף או אינו תקין' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'הסיסמה חייבת להכיל לפחות 8 תווים' });
      }

      const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
      await user.update({ passwordHash: hash, resetToken: null, resetTokenExpiry: null });

      logger.audit('PASSWORD_RESET_COMPLETED', user.id, { ip: req.ip });
      res.json({ message: 'הסיסמה אופסה בהצלחה' });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
