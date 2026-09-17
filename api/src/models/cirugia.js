const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cirugia = sequelize.define('Cirugia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  procedimiento: { type: DataTypes.STRING, allowNull: false },
  complicaciones: { type: DataTypes.TEXT },
}, {
  tableName: 'cirugias',
  timestamps: false,
});

module.exports = Cirugia;
