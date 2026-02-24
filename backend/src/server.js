require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');
const { sequelize } = require('./config/database');
const { verifyConnection: verifyEmail } = require('./config/email');
const logger = require('./config/logger');
const { User, Question, ExamAttempt, ExamConfig } = require('./models');
const { seedQuestions } = require('./utils/seed');

const PORT = process.env.PORT || 3001;

const initializeDatabase = async () => {
  // Sync all models
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

  // Ensure exam config singleton exists
  await ExamConfig.findOrCreate({
    where: { id: 1 },
    defaults: { selectedQuestionIds: [], randomizeOrder: true, passingScore: 8 },
  });

  // Seed questions if not already present
  await seedQuestions(Question, ExamConfig);
  logger.info('Database initialization complete');
};

const start = async () => {
  try {
    await connectDB();
    await initializeDatabase();
    await verifyEmail();

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
