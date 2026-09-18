'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tratamientos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      medicamento: { type: Sequelize.STRING, allowNull: false },
      dosis: { type: Sequelize.STRING },
      duracionDias: { type: Sequelize.INTEGER },
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
    await queryInterface.dropTable('tratamientos');
  },
};
