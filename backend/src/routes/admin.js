const express = require('express');
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireAdmin);

// Logo upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `logo${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (/image\/(png|jpeg|svg\+xml|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/compliance-report', adminController.getComplianceReport);

// Users
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-exam', adminController.resetUserExam);
router.post('/users/:id/reset-training', adminController.resetUserTraining);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// Questions
router.get('/questions', adminController.getQuestions);
router.put('/questions/:id', adminController.updateQuestion);

// Exam Config
router.get('/exam-config', adminController.getExamConfig);
router.put('/exam-config', adminController.updateExamConfig);

// Logo upload
router.post('/logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'לא הועלה קובץ' });
  res.json({ message: 'הלוגו עודכן', filename: req.file.filename });
});

module.exports = router;
