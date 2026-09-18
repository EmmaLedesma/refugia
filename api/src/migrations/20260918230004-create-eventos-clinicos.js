'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('eventos_clinicos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tipo: { type: Sequelize.ENUM('vacuna', 'cirugia', 'tratamiento'), allowNull: false },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      veterinario: { type: Sequelize.STRING },
      notas: { type: Sequelize.TEXT },
      animalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'animales', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('eventos_clinicos');
  },
};
