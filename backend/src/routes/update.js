const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getStatus, checkNow, scheduleUpdate, revert } = require('../controllers/updateController');

router.use(authenticateToken, requireAdmin);

router.get('/status', getStatus);
router.post('/check', checkNow);
router.post('/schedule', scheduleUpdate);
router.post('/revert', revert);

module.exports = router;
