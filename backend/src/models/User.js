const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('employee', 'admin'),
    defaultValue: 'employee',
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  // Training progress
  trainingStartedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'training_started_at',
  },
  trainingCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'training_completed_at',
  },
  trainingSlideProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'training_slide_progress',
  },
  // Exam state
  examCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'exam_completed_at',
  },
  examScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'exam_score',
  },
  examPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'exam_passed',
  },
  examAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'exam_attempts',
  },
  examLockedByAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'exam_locked_by_admin',
  },
  // Password reset
  resetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'reset_token',
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_token_expiry',
  },
  // Metadata
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
  },
  lastLoginIp: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'last_login_ip',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  defaultScope: {
    attributes: { exclude: ['passwordHash', 'resetToken', 'resetTokenExpiry'] },
  },
  scopes: {
    withPassword: { attributes: {} },
    adminView: {
      attributes: { exclude: ['passwordHash', 'resetToken', 'resetTokenExpiry'] },
    },
  },
});

module.exports = User;
