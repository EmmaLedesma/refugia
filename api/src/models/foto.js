const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Foto = sequelize.define('Foto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  url: { type: DataTypes.STRING, allowNull: false }, // URL del objeto en S3
  orden: { type: DataTypes.INTEGER, defaultValue: 0 },
  esPrincipal: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'fotos',
  timestamps: true,
});

module.exports = Foto;
