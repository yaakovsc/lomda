const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/slides', trainingController.getSlides);
router.get('/questions', trainingController.getLearningQuestions);
router.get('/my-progress', trainingController.getMyProgress);
router.get('/modules', trainingController.getModules);
router.post('/start', trainingController.startTraining);
router.post('/progress', trainingController.updateProgress);
router.post('/complete', trainingController.completeTraining);

module.exports = router;
