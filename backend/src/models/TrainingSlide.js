const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TrainingSlide = sequelize.define('TrainingSlide', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  orderIndex: { type: DataTypes.INTEGER, allowNull: false, field: 'order_index' },
  title: { type: DataTypes.STRING(200), allowNull: false },
  icon: DataTypes.STRING(10),
  color: DataTypes.STRING(20),
  content: { type: DataTypes.TEXT, allowNull: false },
  keyPoints: { type: DataTypes.JSONB, defaultValue: [], field: 'key_points' },
  isCustom: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_custom' },
  trainingType: { type: DataTypes.STRING(20), defaultValue: 'cyber', field: 'training_type' },
}, {
  tableName: 'training_slides',
  underscored: true,
  timestamps: true,
});

module.exports = TrainingSlide;
