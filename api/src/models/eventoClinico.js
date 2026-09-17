const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventoClinico = sequelize.define('EventoClinico', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.ENUM('vacuna', 'cirugia', 'tratamiento'), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  veterinario: { type: DataTypes.STRING },
  notas: { type: DataTypes.TEXT },
}, {
  tableName: 'eventos_clinicos',
  timestamps: true,
});

module.exports = EventoClinico;
