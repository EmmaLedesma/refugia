'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('animales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      especie: { type: Sequelize.STRING, allowNull: false },
      edadEstimada: { type: Sequelize.STRING },
      fechaIngreso: { type: Sequelize.DATEONLY, allowNull: false },
      estado: {
        type: Sequelize.ENUM('disponible', 'en_tratamiento', 'en_adopcion', 'adoptado'),
        defaultValue: 'disponible',
      },
      descripcion: { type: Sequelize.TEXT },
      nivelEnergia: { type: Sequelize.ENUM('bajo', 'medio', 'alto') },
      tamaño: { type: Sequelize.ENUM('pequeño', 'mediano', 'grande') },
      aptoNiños: { type: Sequelize.ENUM('si', 'no', 'desconocido'), defaultValue: 'desconocido' },
      aptoOtrosAnimales: { type: Sequelize.ENUM('si', 'no', 'desconocido'), defaultValue: 'desconocido' },
      necesidadesEspeciales: { type: Sequelize.BOOLEAN, defaultValue: false },
      descripcionNecesidades: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('animales');
  },
};
