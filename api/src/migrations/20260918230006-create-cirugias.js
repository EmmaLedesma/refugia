'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cirugias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      procedimiento: { type: Sequelize.STRING, allowNull: false },
      complicaciones: { type: Sequelize.TEXT },
      eventoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'eventos_clinicos', key: 'id' },
        onDelete: 'CASCADE',
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('cirugias');
  },
};
