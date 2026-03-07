const { Question, TrainingSlide, UserModuleProgress, ExamConfig } = require('../models');
const logger = require('../config/logger');

const trainingController = {
  // Get all training slides ordered by orderIndex
  async getSlides(req, res, next) {
    try {
      const trainingType = req.query.type || 'cyber';
      const slides = await TrainingSlide.findAll({
        where: { trainingType },
        order: [['orderIndex', 'ASC']],
      });
      res.json(slides);
    } catch (err) {
      next(err);
    }
  },

  // Get all learning questions (with correct answers for immediate feedback)
  async getLearningQuestions(req, res, next) {
    try {
      const trainingType = req.query.type || 'cyber';
      const questions = await Question.findAll({
        where: { isLearning: true, trainingType },
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
      const trainingType = req.query.type || req.body.type || 'cyber';
      const [progress] = await UserModuleProgress.findOrCreate({
        where: { userId: req.user.id, trainingType },
        defaults: {},
      });

      if (!progress.trainingStartedAt) {
        await progress.update({ trainingStartedAt: new Date() });
        logger.audit('TRAINING_STARTED', req.user.id, { trainingType });
      }

      res.json({
        message: 'ההדרכה התחילה',
        startedAt: progress.trainingStartedAt,
        slideProgress: progress.trainingSlideProgress || 0,
      });
    } catch (err) {
      next(err);
    }
  },

  // Save slide progress
  async updateProgress(req, res, next) {
    try {
      const trainingType = req.query.type || req.body.type || 'cyber';
      const { slideIndex } = req.body;

      const [progress] = await UserModuleProgress.findOrCreate({
        where: { userId: req.user.id, trainingType },
        defaults: {},
      });

      // Only advance, never go back
      if (slideIndex > (progress.trainingSlideProgress || 0)) {
        await progress.update({ trainingSlideProgress: slideIndex });
      }

      res.json({ progress: Math.max(slideIndex, progress.trainingSlideProgress || 0) });
    } catch (err) {
      next(err);
    }
  },

  // Mark training as completed
  async completeTraining(req, res, next) {
    try {
      const trainingType = req.query.type || req.body.type || 'cyber';
      const [progress] = await UserModuleProgress.findOrCreate({
        where: { userId: req.user.id, trainingType },
        defaults: {},
      });

      if (!progress.trainingCompletedAt) {
        await progress.update({ trainingCompletedAt: new Date() });
        logger.audit('TRAINING_COMPLETED', req.user.id, { trainingType });
      }

      res.json({ message: 'ההדרכה הושלמה בהצלחה', completedAt: progress.trainingCompletedAt });
    } catch (err) {
      next(err);
    }
  },

  // Get progress for all modules for the current user
  async getMyProgress(req, res, next) {
    try {
      const progressList = await UserModuleProgress.findAll({
        where: { userId: req.user.id },
      });
      res.json(progressList);
    } catch (err) {
      next(err);
    }
  },
  // Return enabled/disabled state for all modules (used by user nav + module select)
  async getModules(req, res, next) {
    try {
      const configs = await ExamConfig.findAll({ attributes: ['trainingType', 'enabled'] });
      // Build a map; default enabled=true for any module not yet in DB
      const map = {};
      configs.forEach(c => { map[c.trainingType] = c.enabled !== false; });
      const KNOWN = ['cyber', 'haras', 'safety'];
      res.json(KNOWN.map(t => ({ trainingType: t, enabled: map[t] !== false })));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = trainingController;
