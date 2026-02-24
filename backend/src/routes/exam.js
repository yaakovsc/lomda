const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/start', examController.startExam);
router.post('/:attemptId/answer', examController.submitAnswer);
router.post('/:attemptId/submit', examController.submitExam);
router.get('/my-result', examController.getMyResult);

module.exports = router;
