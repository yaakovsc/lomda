const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Question, ExamAttempt, ExamConfig, UserModuleProgress, TrainingSlide } = require('../models');
const logger = require('../config/logger');
const emailService = require('../services/emailService');

const adminController = {
  // ─── Users ─────────────────────────────────────────────────────

  async getUsers(req, res, next) {
    try {
      const { search, department, status, page = 1, limit = 50 } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (department) where.department = department;
      if (status === 'active') where.isActive = true;
      if (status === 'inactive') where.isActive = false;

      const { count, rows } = await User.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        scope: 'adminView',
        include: [{ model: UserModuleProgress, as: 'moduleProgress' }],
      });

      res.json({ total: count, page: parseInt(page), users: rows });
    } catch (err) {
      next(err);
    }
  },

  async createUser(req, res, next) {
    try {
      const { email, name, department, role } = req.body;

      const exists = await User.findOne({ where: { email: email.toLowerCase() } });
      if (exists) return res.status(409).json({ error: 'המשתמש כבר קיים במערכת' });

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      const hash = await bcrypt.hash(tempPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));

      const user = await User.create({
        email: email.toLowerCase(),
        name,
        department,
        role: role || 'employee',
        passwordHash: hash,
        createdBy: req.user.id,
      });

      logger.audit('USER_CREATED', req.user.id, { newUserId: user.id, email: user.email });

      // Send welcome email with temp password
      await emailService.sendWelcome(user, tempPassword);

      res.status(201).json({ user, tempPassword, message: 'המשתמש נוצר ואימייל ברוך הבא נשלח' });
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, department, role, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

      // Prevent self-demotion from admin
      if (id === req.user.id && role === 'employee') {
        return res.status(400).json({ error: 'אינך יכול להסיר את הרשאות המנהל שלך' });
      }

      await user.update({ name, department, role, isActive });
      logger.audit('USER_UPDATED', req.user.id, { targetUserId: id });

      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      if (id === req.user.id) {
        return res.status(400).json({ error: 'אינך יכול למחוק את עצמך' });
      }
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

      await user.destroy();
      logger.audit('USER_DELETED', req.user.id, { targetUserId: id, email: user.email });
      res.json({ message: 'המשתמש נמחק' });
    } catch (err) {
      next(err);
    }
  },

  async resetUserExam(req, res, next) {
    try {
      const { id } = req.params;
      const trainingType = req.body.trainingType || 'cyber';

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

      await UserModuleProgress.update(
        { examCompletedAt: null, examScore: null, examPassed: null, examAttempts: 0, examLockedByAdmin: false },
        { where: { userId: id, trainingType } }
      );

      await ExamAttempt.destroy({ where: { userId: id, trainingType } });

      logger.audit('EXAM_RESET', req.user.id, { targetUserId: id, trainingType });
      res.json({ message: 'הבחינה אופסה בהצלחה. המשתמש יוכל לגשת שוב לבחינה.' });
    } catch (err) {
      next(err);
    }
  },

  async resetUserTraining(req, res, next) {
    try {
      const { id } = req.params;
      const trainingType = req.body.trainingType || 'cyber';

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

      await UserModuleProgress.update(
        {
          trainingStartedAt: null,
          trainingCompletedAt: null,
          trainingSlideProgress: 0,
          examCompletedAt: null,
          examScore: null,
          examPassed: null,
          examAttempts: 0,
          examLockedByAdmin: false,
        },
        { where: { userId: id, trainingType } }
      );

      await ExamAttempt.destroy({ where: { userId: id, trainingType } });

      logger.audit('TRAINING_RESET', req.user.id, { targetUserId: id, trainingType });
      res.json({ message: 'ההדרכה והבחינה אופסו. המשתמש יצטרך לעבור את ההדרכה מחדש.' });
    } catch (err) {
      next(err);
    }
  },

  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

      const tempPassword = Math.random().toString(36).slice(-8) + 'B2@';
      const hash = await bcrypt.hash(tempPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));

      await User.scope('withPassword').update(
        { passwordHash: hash, resetToken: null, resetTokenExpiry: null },
        { where: { id } }
      );

      await emailService.sendWelcome(user, tempPassword);
      logger.audit('PASSWORD_ADMIN_RESET', req.user.id, { targetUserId: id });
      res.json({ tempPassword, message: 'הסיסמה אופסה ואימייל נשלח למשתמש' });
    } catch (err) {
      next(err);
    }
  },

  // ─── Questions ─────────────────────────────────────────────────

  async getQuestions(req, res, next) {
    try {
      const trainingType = req.query.type || 'cyber';
      const questions = await Question.findAll({
        where: { trainingType },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      });
      res.json(questions);
    } catch (err) {
      next(err);
    }
  },

  async updateQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const q = await Question.findByPk(id);
      if (!q) return res.status(404).json({ error: 'שאלה לא נמצאה' });

      const allowed = ['questionText', 'options', 'correctAnswers', 'explanation', 'category', 'type', 'sortOrder'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      await q.update(updates);
      logger.audit('QUESTION_UPDATED', req.user.id, { questionId: id });
      res.json(q);
    } catch (err) {
      next(err);
    }
  },

  // ─── Slides ────────────────────────────────────────────────────

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

  async updateSlide(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content, keyPoints } = req.body;
      const slide = await TrainingSlide.findByPk(id);
      if (!slide) return res.status(404).json({ error: 'שקף לא נמצא' });
      await slide.update({ title, content, keyPoints });
      logger.audit('SLIDE_UPDATED', req.user.id, { slideId: id, title });
      res.json(slide);
    } catch (err) {
      next(err);
    }
  },

  // ─── Exam Config ───────────────────────────────────────────────

  async getExamConfig(req, res, next) {
    try {
      const trainingType = req.query.type || 'cyber';
      const [config] = await ExamConfig.findOrCreate({
        where: { trainingType },
        defaults: { selectedQuestionIds: [], randomizeOrder: true, passingScore: 8 },
      });
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async updateExamConfig(req, res, next) {
    try {
      const { selectedQuestionIds, randomizeOrder, passingScore, trainingType: tt } = req.body;
      const trainingType = tt || 'cyber';

      if (!Array.isArray(selectedQuestionIds) || selectedQuestionIds.length !== 10) {
        return res.status(400).json({ error: 'יש לבחור בדיוק 10 שאלות לבחינה' });
      }

      const [config] = await ExamConfig.findOrCreate({
        where: { trainingType },
        defaults: {},
      });

      await config.update({
        selectedQuestionIds,
        randomizeOrder: randomizeOrder !== false,
        passingScore: passingScore || 8,
        updatedBy: req.user.id,
      });

      // Mark selected questions for this training type only
      await Question.update({ isExamQuestion: false }, { where: { trainingType } });
      await Question.update({ isExamQuestion: true }, { where: { id: selectedQuestionIds } });

      logger.audit('EXAM_CONFIG_UPDATED', req.user.id, { selectedQuestionIds, trainingType });
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async toggleModule(req, res, next) {
    try {
      const { trainingType, enabled } = req.body;
      if (!trainingType || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'trainingType and enabled (boolean) required' });
      }
      const [config] = await ExamConfig.findOrCreate({
        where: { trainingType },
        defaults: { selectedQuestionIds: [], randomizeOrder: true, passingScore: 8, enabled: true },
      });
      await config.update({ enabled });
      logger.audit('MODULE_TOGGLED', req.user.id, { trainingType, enabled });
      res.json({ trainingType, enabled });
    } catch (err) {
      next(err);
    }
  },

  // ─── Reports & Dashboard ───────────────────────────────────────

  async getDashboardStats(req, res, next) {
    try {
      const type = req.query.type || 'cyber';
      const typeFilter = type === 'all' ? {} : { trainingType: type };

      const [
        totalUsers,
        activeUsers,
        trainingCompleted,
        examPassed,
        examFailed,
        recentAttempts,
      ] = await Promise.all([
        User.count({ where: { role: 'employee' } }),
        User.count({ where: { role: 'employee', isActive: true } }),
        UserModuleProgress.count({ where: { ...typeFilter, trainingCompletedAt: { [Op.ne]: null } } }),
        UserModuleProgress.count({ where: { ...typeFilter, examPassed: true } }),
        UserModuleProgress.count({ where: { ...typeFilter, examPassed: false, examCompletedAt: { [Op.ne]: null } } }),
        ExamAttempt.findAll({
          where: { isSubmitted: true, ...(type !== 'all' ? { trainingType: type } : {}) },
          order: [['completedAt', 'DESC']],
          limit: 10,
          include: [{ model: User, as: 'user', attributes: ['name', 'email', 'department'] }],
        }),
      ]);

      res.json({
        totalUsers,
        activeUsers,
        trainingCompleted,
        trainingNotStarted: activeUsers - trainingCompleted,
        examPassed,
        examFailed,
        examPending: trainingCompleted - examPassed - examFailed,
        complianceRate: activeUsers > 0 ? Math.round((examPassed / activeUsers) * 100) : 0,
        recentAttempts,
      });
    } catch (err) {
      next(err);
    }
  },

  async getComplianceReport(req, res, next) {
    try {
      const users = await User.findAll({
        where: { role: 'employee' },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'email', 'department', 'isActive', 'lastLoginAt', 'createdAt'],
        include: [{ model: UserModuleProgress, as: 'moduleProgress' }],
      });

      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;
