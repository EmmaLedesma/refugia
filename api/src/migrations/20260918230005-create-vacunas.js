'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vacunas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombreVacuna: { type: Sequelize.STRING, allowNull: false },
      proximaDosis: { type: Sequelize.DATEONLY },
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
    await queryInterface.dropTable('vacunas');
  },
};
