const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Adoptante = sequelize.define('Adoptante', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  contacto: { type: DataTypes.STRING, allowNull: false }, // teléfono o email
  tipoVivienda: { type: DataTypes.ENUM('departamento', 'casa_sin_patio', 'casa_con_patio'), allowNull: false },
  tamañoEspacioM2: { type: DataTypes.FLOAT },
  tieneNiños: { type: DataTypes.BOOLEAN, defaultValue: false },
  edadesNiños: { type: DataTypes.STRING }, // ej. "5, 8" — texto libre por simplicidad del MVP
  tieneOtrosAnimales: { type: DataTypes.BOOLEAN, defaultValue: false },
  tipoOtrosAnimales: { type: DataTypes.STRING },
  tiempoDisponibleHorasDia: { type: DataTypes.FLOAT, allowNull: false },
  experienciaPreviaMascotas: { type: DataTypes.ENUM('ninguna', 'basica', 'avanzada'), defaultValue: 'ninguna' },
  nivelActividadDeseado: { type: DataTypes.ENUM('bajo', 'medio', 'alto') },
}, {
  tableName: 'adoptantes',
  timestamps: true,
});

module.exports = Adoptante;
