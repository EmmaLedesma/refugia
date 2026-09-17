const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vacuna = sequelize.define('Vacuna', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombreVacuna: { type: DataTypes.STRING, allowNull: false },
  proximaDosis: { type: DataTypes.DATEONLY },
}, {
  tableName: 'vacunas',
  timestamps: false,
});

module.exports = Vacuna;
