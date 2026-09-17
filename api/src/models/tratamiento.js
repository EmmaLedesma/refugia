const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tratamiento = sequelize.define('Tratamiento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicamento: { type: DataTypes.STRING, allowNull: false },
  dosis: { type: DataTypes.STRING },
  duracionDias: { type: DataTypes.INTEGER },
}, {
  tableName: 'tratamientos',
  timestamps: false,
});

module.exports = Tratamiento;
