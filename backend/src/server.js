require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');
const { sequelize } = require('./config/database');
const { verifyConnection: verifyEmail } = require('./config/email');
const logger = require('./config/logger');
const { User, Question, ExamAttempt, ExamConfig, TrainingSlide } = require('./models');
const { seedQuestions, seedSlides, seedHarasSlides, seedHarasQuestions, seedSafetySlides, seedSafetyQuestions } = require('./utils/seed');
const { migrate } = require('./utils/migrate');
const updateService = require('./services/updateService');

const PORT = process.env.PORT || 3001;

const initializeDatabase = async () => {
  // Run idempotent migrations first (adds columns/tables for existing installs)
  await migrate();

  // Sync all models (creates new tables from model definitions)
  await sequelize.sync({ alter: false });
  logger.info('Database models synchronized');

  // Ensure admin account exists
  const bcrypt = require('bcryptjs');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@giron.co.il';
  const adminExists = await User.findOne({ where: { email: adminEmail } });
  if (!adminExists) {
    const hash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@2024!',
      parseInt(process.env.BCRYPT_ROUNDS || '12')
    );
    await User.create({
      email: adminEmail,
      name: process.env.ADMIN_NAME || 'מנהל מערכת',
      role: 'admin',
      passwordHash: hash,
    });
    logger.info('Default admin account created', { email: adminEmail });
  }

  // Ensure exam config rows exist (one per module)
  await ExamConfig.findOrCreate({
    where: { trainingType: 'cyber' },
    defaults: { selectedQuestionIds: [], randomizeOrder: true, passingScore: 8 },
  });
  await ExamConfig.findOrCreate({
    where: { trainingType: 'haras' },
    defaults: { selectedQuestionIds: [], randomizeOrder: true, passingScore: 8 },
  });
  await ExamConfig.findOrCreate({
    where: { trainingType: 'safety' },
    defaults: { selectedQuestionIds: [], randomizeOrder: true, passingScore: 8 },
  });

  // Seed questions and slides if not already present
  await seedQuestions(Question, ExamConfig);
  await seedSlides(TrainingSlide);
  await seedHarasSlides(TrainingSlide);
  await seedHarasQuestions(Question, ExamConfig);
  await seedSafetySlides(TrainingSlide);
  await seedSafetyQuestions(Question, ExamConfig);
  logger.info('Database initialization complete');
};

const start = async () => {
  try {
    await connectDB();
    await initializeDatabase();
    await verifyEmail();
    updateService.startPolling();

    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Girón Security Training API started`, {
        port: PORT,
        env: process.env.NODE_ENV,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        logger.info('Server shut down cleanly');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
