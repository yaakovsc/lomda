const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// One row per training module (trainingType is the logical key)
const ExamConfig = sequelize.define('ExamConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  trainingType: {
    type: DataTypes.STRING(20),
    defaultValue: 'cyber',
    field: 'training_type',
  },
  // Array of question IDs selected for exam (max 10 by business rule)
  selectedQuestionIds: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    field: 'selected_question_ids',
  },
  randomizeOrder: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'randomize_order',
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
    field: 'passing_score',
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'enabled',
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'updated_by',
  },
}, {
  tableName: 'exam_config',
  timestamps: true,
  underscored: true,
});

module.exports = ExamConfig;
