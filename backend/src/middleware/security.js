const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const corsOptions = {
  origin: (origin, callback) => {
    const configured = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());
    const localhostVariants = ['http://localhost', 'https://localhost', 'http://localhost:3000', 'http://localhost:5173'];
    const allowed = [...new Set([...configured, ...localhostVariants])];
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = { corsMiddleware: cors(corsOptions), helmetMiddleware: helmetConfig, compressionMiddleware: compression() };
