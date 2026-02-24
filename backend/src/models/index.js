const User = require('./User');
const Question = require('./Question');
const ExamAttempt = require('./ExamAttempt');
const ExamConfig = require('./ExamConfig');

// Associations
User.hasMany(ExamAttempt, { foreignKey: 'userId', as: 'attempts' });
ExamAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Question, ExamAttempt, ExamConfig };
