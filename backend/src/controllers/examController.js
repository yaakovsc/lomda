const { User, Question, ExamAttempt, ExamConfig, UserModuleProgress } = require('../models');
const logger = require('../config/logger');
const emailService = require('../services/emailService');

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const examController = {
  // Start a new exam attempt
  async startExam(req, res, next) {
    try {
      const trainingType = req.body.type || req.query.type || 'cyber';
      const user = await User.findByPk(req.user.id);

      const [progress] = await UserModuleProgress.findOrCreate({
        where: { userId: user.id, trainingType },
        defaults: {},
      });

      // Must complete training first
      if (!progress.trainingCompletedAt) {
        return res.status(403).json({ error: 'יש להשלים את ההדרכה לפני הבחינה' });
      }

      // Check if already passed
      if (progress.examPassed) {
        return res.status(400).json({ error: 'כבר עברת את הבחינה בהצלחה' });
      }

      // Block if locked — admin must release
      if (progress.examLockedByAdmin) {
        return res.status(403).json({ error: 'הגישה לבחינה חסומה. אנא פנה למנהל המערכת לשחרור.' });
      }

      // Load exam config for this module
      const config = await ExamConfig.findOne({ where: { trainingType } });
      if (!config || config.selectedQuestionIds.length < 10) {
        return res.status(503).json({ error: 'הבחינה טרם הוגדרה על ידי המנהל. אנא פנה למנהל המערכת.' });
      }

      // Fetch all questions from the pool
      const allQuestions = await Question.findAll({
        where: { id: config.selectedQuestionIds },
      });

      if (allQuestions.length < 10) {
        return res.status(503).json({ error: 'שגיאה בטעינת שאלות הבחינה' });
      }

      // Randomly pick 10 from the pool (always randomized)
      const ordered = shuffleArray(allQuestions).slice(0, 10);

      // Build snapshot (without correct answers exposed)
      const snapshot = ordered.map((q) => ({
        id: q.id,
        type: q.type,
        category: q.category,
        questionText: q.questionText,
        options: q.options,
        // correctAnswers intentionally omitted
      }));

      const attempt = await ExamAttempt.create({
        userId: user.id,
        questionsSnapshot: snapshot,
        totalQuestions: snapshot.length,
        answers: {},
        currentQuestion: 0,
        trainingType,
      });

      await progress.update({
        examAttempts: (progress.examAttempts || 0) + 1,
        examLockedByAdmin: true,
      });

      logger.audit('EXAM_STARTED', user.id, { attemptId: attempt.id, trainingType });

      res.json({
        attemptId: attempt.id,
        totalQuestions: attempt.totalQuestions,
        currentQuestion: 0,
        question: snapshot[0],
        answers: {},
        resumed: false,
      });
    } catch (err) {
      next(err);
    }
  },

  // Submit an answer for the current question (move to next)
  async submitAnswer(req, res, next) {
    try {
      const { attemptId } = req.params;
      const { questionId, answer } = req.body; // answer: array of option ids

      const attempt = await ExamAttempt.findOne({
        where: { id: attemptId, userId: req.user.id },
      });

      if (!attempt) return res.status(404).json({ error: 'ניסיון בחינה לא נמצא' });
      if (attempt.isSubmitted) return res.status(400).json({ error: 'הבחינה כבר הוגשה' });

      // Validate the question is the current one
      const currentQ = attempt.questionsSnapshot[attempt.currentQuestion];
      if (!currentQ || currentQ.id !== questionId) {
        return res.status(400).json({ error: 'שאלה לא תקינה' });
      }

      // Record answer
      const updatedAnswers = { ...attempt.answers, [questionId]: answer };
      const nextIndex = attempt.currentQuestion + 1;
      const isLast = nextIndex >= attempt.totalQuestions;

      await attempt.update({
        answers: updatedAnswers,
        currentQuestion: isLast ? attempt.currentQuestion : nextIndex,
      });

      if (isLast) {
        return res.json({ done: true, nextQuestion: null });
      }

      res.json({
        done: false,
        nextQuestion: attempt.questionsSnapshot[nextIndex],
        nextIndex,
      });
    } catch (err) {
      next(err);
    }
  },

  // Submit the full exam for grading
  async submitExam(req, res, next) {
    try {
      const { attemptId } = req.params;

      const attempt = await ExamAttempt.findOne({
        where: { id: attemptId, userId: req.user.id },
      });

      if (!attempt) return res.status(404).json({ error: 'ניסיון בחינה לא נמצא' });
      if (attempt.isSubmitted) return res.status(400).json({ error: 'הבחינה כבר הוגשה' });

      const trainingType = attempt.trainingType || 'cyber';

      // Load questions with correct answers for grading
      const questionIds = attempt.questionsSnapshot.map((q) => q.id);
      const questions = await Question.findAll({ where: { id: questionIds } });
      const qMap = Object.fromEntries(questions.map((q) => [q.id, q]));

      const config = await ExamConfig.findOne({ where: { trainingType } });
      const passingScore = config?.passingScore || 8;

      let score = 0;
      const results = attempt.questionsSnapshot.map((qSnap) => {
        const q = qMap[qSnap.id];
        const userAnswer = attempt.answers[qSnap.id] || [];
        const correctAnswers = q.correctAnswers;

        // Correct if user's sorted answers match correct sorted answers
        const isCorrect =
          userAnswer.length === correctAnswers.length &&
          [...userAnswer].sort().join(',') === [...correctAnswers].sort().join(',');

        if (isCorrect) score++;

        return {
          questionId: qSnap.id,
          questionText: qSnap.questionText,
          userAnswer,
          correctAnswers,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const passed = score >= passingScore;

      await attempt.update({
        results,
        score,
        passed,
        completedAt: new Date(),
        isSubmitted: true,
      });

      const user = await User.findByPk(req.user.id);

      const [progress] = await UserModuleProgress.findOrCreate({
        where: { userId: user.id, trainingType },
        defaults: {},
      });

      await progress.update({
        examCompletedAt: new Date(),
        examScore: score,
        examPassed: passed,
      });

      logger.audit('EXAM_SUBMITTED', user.id, {
        attemptId,
        score,
        total: attempt.totalQuestions,
        passed,
        trainingType,
      });

      // Send result email asynchronously
      emailService.sendExamResult(user, score, passed, attempt.totalQuestions).catch(() => {});

      res.json({
        score,
        totalQuestions: attempt.totalQuestions,
        passed,
        passingScore,
        results,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get the result of the most recent completed attempt
  async getMyResult(req, res, next) {
    try {
      const trainingType = req.query.type || 'cyber';
      const attempt = await ExamAttempt.findOne({
        where: { userId: req.user.id, isSubmitted: true, trainingType },
        order: [['completedAt', 'DESC']],
      });

      if (!attempt) return res.status(404).json({ error: 'לא נמצאה בחינה מוגשת' });
      res.json(attempt);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = examController;
