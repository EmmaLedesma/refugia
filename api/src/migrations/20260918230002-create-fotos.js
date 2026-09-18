'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fotos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      url: { type: Sequelize.STRING, allowNull: false },
      orden: { type: Sequelize.INTEGER, defaultValue: 0 },
      esPrincipal: { type: Sequelize.BOOLEAN, defaultValue: false },
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
    await queryInterface.dropTable('fotos');
  },
};
