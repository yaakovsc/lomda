const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserModuleProgress = sequelize.define('UserModuleProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  trainingType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'training_type',
  },
  trainingStartedAt: {
    type: DataTypes.DATE,
    field: 'training_started_at',
  },
  trainingCompletedAt: {
    type: DataTypes.DATE,
    field: 'training_completed_at',
  },
  trainingSlideProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'training_slide_progress',
  },
  examCompletedAt: {
    type: DataTypes.DATE,
    field: 'exam_completed_at',
  },
  examScore: {
    type: DataTypes.INTEGER,
    field: 'exam_score',
  },
  examPassed: {
    type: DataTypes.BOOLEAN,
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
}, {
  tableName: 'user_module_progress',
  underscored: true,
  timestamps: true,
});

module.exports = UserModuleProgress;
