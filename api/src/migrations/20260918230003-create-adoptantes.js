'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('adoptantes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      contacto: { type: Sequelize.STRING, allowNull: false },
      tipoVivienda: {
        type: Sequelize.ENUM('departamento', 'casa_sin_patio', 'casa_con_patio'),
        allowNull: false,
      },
      tamañoEspacioM2: { type: Sequelize.FLOAT },
      tieneNiños: { type: Sequelize.BOOLEAN, defaultValue: false },
      edadesNiños: { type: Sequelize.STRING },
      tieneOtrosAnimales: { type: Sequelize.BOOLEAN, defaultValue: false },
      tipoOtrosAnimales: { type: Sequelize.STRING },
      tiempoDisponibleHorasDia: { type: Sequelize.FLOAT, allowNull: false },
      experienciaPreviaMascotas: {
        type: Sequelize.ENUM('ninguna', 'basica', 'avanzada'),
        defaultValue: 'ninguna',
      },
      nivelActividadDeseado: { type: Sequelize.ENUM('bajo', 'medio', 'alto') },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('adoptantes');
  },
};
