const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamAttempt = sequelize.define('ExamAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
  },
  // Snapshot of questions as presented (with shuffled order)
  questionsSnapshot: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'questions_snapshot',
  },
  // User's answers: {questionId: [answerId, ...]}
  answers: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  // Per-question results after grading
  results: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'results',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_questions',
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'started_at',
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
  },
  // Current question index (0-based) for session continuity
  currentQuestion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_question',
  },
  isSubmitted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_submitted',
  },
  trainingType: {
    type: DataTypes.STRING(20),
    defaultValue: 'cyber',
    field: 'training_type',
  },
}, {
  tableName: 'exam_attempts',
  timestamps: true,
  underscored: true,
});

module.exports = ExamAttempt;
