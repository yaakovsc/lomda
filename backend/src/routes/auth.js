const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

const validateInput = (validations) => async (req, res, next) => {
  const { validationResult } = require('express-validator');
  for (const v of validations) await v.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'נתונים לא תקינים', details: errors.array() });
  }
  next();
};

router.post('/login', authLimiter, validateInput([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 1 }),
]), authController.login);

router.post('/change-password', authenticateToken, validateInput([
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
]), authController.changePassword);

router.post('/request-reset', passwordResetLimiter, validateInput([
  body('email').isEmail().normalizeEmail(),
]), authController.requestPasswordReset);

router.post('/reset-password', validateInput([
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
]), authController.resetPassword);

router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
