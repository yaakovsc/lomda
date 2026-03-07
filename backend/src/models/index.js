const User = require('./User');
const Question = require('./Question');
const ExamAttempt = require('./ExamAttempt');
const ExamConfig = require('./ExamConfig');
const TrainingSlide = require('./TrainingSlide');
const CompanySetting = require('./CompanySetting');
const UserModuleProgress = require('./UserModuleProgress');

// Associations
User.hasMany(ExamAttempt, { foreignKey: 'userId', as: 'attempts' });
ExamAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(UserModuleProgress, { foreignKey: 'userId', as: 'moduleProgress' });
UserModuleProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Question, ExamAttempt, ExamConfig, TrainingSlide, CompanySetting, UserModuleProgress };
