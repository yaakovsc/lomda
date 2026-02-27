require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');

const { corsMiddleware, helmetMiddleware, compressionMiddleware } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const authRoutes = require('./routes/auth');
const trainingRoutes = require('./routes/training');
const examRoutes = require('./routes/exam');
const adminRoutes = require('./routes/admin');
const updateRoutes = require('./routes/update');
const maintenanceMiddleware = require('./middleware/maintenance');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);

// ─── Request Logging ─────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
  skip: (req) => req.path === '/api/health',
}));

// ─── Body Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Static Files (Uploaded Logos) ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Girón Security Training API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Maintenance Mode ─────────────────────────────────────────────
app.use(maintenanceMiddleware);

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/update', updateRoutes);

// ─── Error Handling ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
