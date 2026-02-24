const { User, Question } = require('../models');
const logger = require('../config/logger');

const trainingController = {
  // Get all learning questions (with correct answers for immediate feedback)
  async getLearningQuestions(req, res, next) {
    try {
      const questions = await Question.findAll({
        where: { isLearning: true },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      });
      res.json(questions);
    } catch (err) {
      next(err);
    }
  },

  // Mark training as started
  async startTraining(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user.trainingStartedAt) {
        await user.update({ trainingStartedAt: new Date() });
        logger.audit('TRAINING_STARTED', user.id);
      }
      res.json({ message: 'ההדרכה התחילה', startedAt: user.trainingStartedAt });
    } catch (err) {
      next(err);
    }
  },

  // Save slide progress
  async updateProgress(req, res, next) {
    try {
      const { slideIndex } = req.body;
      const user = await User.findByPk(req.user.id);

      // Only advance, never go back
      if (slideIndex > (user.trainingSlideProgress || 0)) {
        await user.update({ trainingSlideProgress: slideIndex });
      }

      res.json({ progress: Math.max(slideIndex, user.trainingSlideProgress || 0) });
    } catch (err) {
      next(err);
    }
  },

  // Mark training as completed
  async completeTraining(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user.trainingCompletedAt) {
        await user.update({ trainingCompletedAt: new Date() });
        logger.audit('TRAINING_COMPLETED', user.id);
      }
      res.json({ message: 'ההדרכה הושלמה בהצלחה', completedAt: user.trainingCompletedAt });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = trainingController;
