const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // 'single' = one correct answer, 'multiple' = multiple correct answers
  type: {
    type: DataTypes.ENUM('single', 'multiple'),
    allowNull: false,
    defaultValue: 'single',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text',
  },
  // JSON array of {id, text}
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  // Array of correct option ids (for multiple choice, multiple values)
  correctAnswers: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'correct_answers',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Used in learning module interactive scenarios
  isLearning: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_learning',
  },
  // Whether this question is selected for the exam pool (admin selects 10 from 20)
  isExamQuestion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_exam_question',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_custom',
  },
  trainingType: {
    type: DataTypes.STRING(20),
    defaultValue: 'cyber',
    field: 'training_type',
  },
}, {
  tableName: 'questions',
  timestamps: true,
  underscored: true,
});

module.exports = Question;
