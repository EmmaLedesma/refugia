'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('postulaciones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW },
      scoreMatching: { type: Sequelize.FLOAT },
      detalleMatching: { type: Sequelize.JSON },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aceptada', 'rechazada'),
        defaultValue: 'pendiente',
      },
      animalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'animales', key: 'id' },
        onDelete: 'CASCADE',
      },
      adoptanteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'adoptantes', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('postulaciones');
  },
};
