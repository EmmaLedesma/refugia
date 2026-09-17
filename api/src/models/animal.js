const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Animal = sequelize.define('Animal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  especie: { type: DataTypes.STRING, allowNull: false }, // genérico, no enum cerrado
  edadEstimada: { type: DataTypes.STRING }, // texto libre: "2 años", "cachorro", etc.
  fechaIngreso: { type: DataTypes.DATEONLY, allowNull: false },
  estado: {
    type: DataTypes.ENUM('disponible', 'en_tratamiento', 'en_adopcion', 'adoptado'),
    defaultValue: 'disponible',
  },
  descripcion: { type: DataTypes.TEXT },
  // Atributos de matching (ver docs/data-model.md)
  nivelEnergia: { type: DataTypes.ENUM('bajo', 'medio', 'alto') },
  tamaño: { type: DataTypes.ENUM('pequeño', 'mediano', 'grande') },
  aptoNiños: { type: DataTypes.ENUM('si', 'no', 'desconocido'), defaultValue: 'desconocido' },
  aptoOtrosAnimales: { type: DataTypes.ENUM('si', 'no', 'desconocido'), defaultValue: 'desconocido' },
  necesidadesEspeciales: { type: DataTypes.BOOLEAN, defaultValue: false },
  descripcionNecesidades: { type: DataTypes.TEXT },
}, {
  tableName: 'animales',
  timestamps: true,
});

module.exports = Animal;
