const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Singleton config table — always one row (id=1)
const ExamConfig = sequelize.define('ExamConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
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
