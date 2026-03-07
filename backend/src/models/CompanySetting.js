const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanySetting = sequelize.define('CompanySetting', {
  key: { type: DataTypes.STRING(100), primaryKey: true },
  value: DataTypes.TEXT,
}, {
  tableName: 'company_settings',
  underscored: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = CompanySetting;
