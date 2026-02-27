const updateService = require('../services/updateService');

const EXEMPT_PATHS = [
  '/api/health',
  '/api/admin/update/status',
  '/api/admin/update/check',
];

const maintenanceMiddleware = (req, res, next) => {
  if (updateService.maintenanceMode) {
    const exempt = EXEMPT_PATHS.some(p => req.path === p || req.path.startsWith(p));
    if (!exempt) {
      return res.status(503).json({
        maintenance: true,
        message: 'המערכת תחת עידכון. נא להיכנס מחדש בעוד מספר דקות.',
        estimatedMinutes: 5,
      });
    }
  }
  next();
};

module.exports = maintenanceMiddleware;
