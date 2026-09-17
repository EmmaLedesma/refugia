const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Postulacion = sequelize.define('Postulacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  scoreMatching: { type: DataTypes.FLOAT }, // 0-100, calculado por matchingService
  detalleMatching: { type: DataTypes.JSON }, // qué atributos pesaron en el score
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada'),
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'postulaciones',
  timestamps: true,
});

module.exports = Postulacion;
