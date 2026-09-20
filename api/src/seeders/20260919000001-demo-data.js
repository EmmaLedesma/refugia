'use strict';
const { calcularScore } = require('../services/matchingService');

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();

    // --- Animales adicionales (Firulais ya existe, id 1, no se toca) ---
    const animales = [
      {
        nombre: 'Michi', especie: 'gato', edadEstimada: '1 año', fechaIngreso: '2026-08-10',
        estado: 'disponible', nivelEnergia: 'bajo', tamaño: 'pequeño',
        aptoNiños: 'si', aptoOtrosAnimales: 'desconocido', necesidadesEspeciales: false,
        createdAt: ahora, updatedAt: ahora,
      },
      {
        nombre: 'Rocky', especie: 'perro', edadEstimada: '3 años', fechaIngreso: '2026-07-22',
        estado: 'disponible', nivelEnergia: 'alto', tamaño: 'grande',
        aptoNiños: 'no', aptoOtrosAnimales: 'desconocido', necesidadesEspeciales: true,
        descripcionNecesidades: 'Requiere paseos largos diarios, no apto para departamentos chicos',
        createdAt: ahora, updatedAt: ahora,
      },
      {
        nombre: 'Luna', especie: 'gato', edadEstimada: '2 años', fechaIngreso: '2026-09-01',
        estado: 'disponible', nivelEnergia: 'medio', tamaño: 'pequeño',
        aptoNiños: 'si', aptoOtrosAnimales: 'si', necesidadesEspeciales: false,
        createdAt: ahora, updatedAt: ahora,
      },
      {
        nombre: 'Toby', especie: 'perro', edadEstimada: '5 años', fechaIngreso: '2026-06-15',
        estado: 'disponible', nivelEnergia: 'bajo', tamaño: 'mediano',
        aptoNiños: 'si', aptoOtrosAnimales: 'si', necesidadesEspeciales: false,
        createdAt: ahora, updatedAt: ahora,
      },
    ];
    await queryInterface.bulkInsert('animales', animales);

    // --- Adoptantes adicionales (Maria Perez ya existe, id 1, no se toca) ---
    const adoptantes = [
      {
        nombre: 'Juan Gomez', contacto: 'juan@example.com', tipoVivienda: 'departamento',
        tieneNiños: true, edadesNiños: '6', tieneOtrosAnimales: false,
        tiempoDisponibleHorasDia: 2, experienciaPreviaMascotas: 'ninguna',
        nivelActividadDeseado: 'bajo', createdAt: ahora, updatedAt: ahora,
      },
      {
        nombre: 'Ana Lopez', contacto: 'ana@example.com', tipoVivienda: 'casa_con_patio',
        tieneNiños: true, edadesNiños: '10, 14', tieneOtrosAnimales: true, tipoOtrosAnimales: 'perro adulto',
        tiempoDisponibleHorasDia: 8, experienciaPreviaMascotas: 'avanzada',
        nivelActividadDeseado: 'medio', createdAt: ahora, updatedAt: ahora,
      },
      {
        nombre: 'Carlos Ruiz', contacto: 'carlos@example.com', tipoVivienda: 'casa_sin_patio',
        tieneNiños: false, tieneOtrosAnimales: false,
        tiempoDisponibleHorasDia: 1, experienciaPreviaMascotas: 'basica',
        nivelActividadDeseado: 'alto', createdAt: ahora, updatedAt: ahora,
      },
    ];
    await queryInterface.bulkInsert('adoptantes', adoptantes);

    // Traer los IDs reales recién insertados (autoincrement, no asumimos números fijos)
    const [animalesDb] = await queryInterface.sequelize.query(
      `SELECT id, nombre, "nivelEnergia", tamaño, "aptoNiños", "aptoOtrosAnimales" FROM animales WHERE nombre IN ('Michi','Rocky','Luna','Toby')`
    );
    const [adoptantesDb] = await queryInterface.sequelize.query(
      `SELECT id, nombre, "tipoVivienda", "tieneNiños", "tieneOtrosAnimales", "tiempoDisponibleHorasDia", "nivelActividadDeseado" FROM adoptantes WHERE nombre IN ('Juan Gomez','Ana Lopez','Carlos Ruiz')`
    );
    const [animalOriginal] = await queryInterface.sequelize.query(
      `SELECT id, nombre, especie, "edadEstimada", estado, "nivelEnergia", tamaño, "aptoNiños", "aptoOtrosAnimales", "necesidadesEspeciales" FROM animales WHERE nombre = 'Firulais'`
    );

    const buscarAnimal = (nombre) => animalesDb.find((a) => a.nombre === nombre) || animalOriginal[0];
    const buscarAdoptante = (nombre) => adoptantesDb.find((a) => a.nombre === nombre);

    // Combinaciones pensadas para mostrar el rango del scoring: match alto, medio y bajo
    const combinaciones = [
      { animal: 'Toby', adoptante: 'Ana Lopez' },      // esperable: score alto (energía/tamaño/niños/otros animales compatibles)
      { animal: 'Rocky', adoptante: 'Juan Gomez' },     // esperable: score bajo (Rocky no apto niños, departamento chico, poco tiempo)
      { animal: 'Michi', adoptante: 'Carlos Ruiz' },    // esperable: score medio-bajo (poco tiempo disponible)
      { animal: 'Luna', adoptante: 'Ana Lopez' },       // esperable: score alto
    ];

    const postulaciones = combinaciones.map(({ animal, adoptante }) => {
      const animalRow = buscarAnimal(animal);
      const adoptanteRow = buscarAdoptante(adoptante);
      // calcularScore espera los nombres de atributo tal como los usa el modelo (camelCase)
      const { score, detalle } = calcularScore(
        {
          nivelEnergia: animalRow.nivelEnergia,
          tamaño: animalRow.tamaño,
          aptoNiños: animalRow.aptoNiños,
          aptoOtrosAnimales: animalRow.aptoOtrosAnimales,
        },
        {
          tipoVivienda: adoptanteRow.tipoVivienda,
          tieneNiños: adoptanteRow.tieneNiños,
          tieneOtrosAnimales: adoptanteRow.tieneOtrosAnimales,
          tiempoDisponibleHorasDia: adoptanteRow.tiempoDisponibleHorasDia,
          nivelActividadDeseado: adoptanteRow.nivelActividadDeseado,
        }
      );
      return {
        animalId: animalRow.id,
        adoptanteId: adoptanteRow.id,
        fecha: '2026-09-19',
        scoreMatching: score,
        detalleMatching: JSON.stringify(detalle),
        estado: 'pendiente',
        createdAt: ahora,
        updatedAt: ahora,
      };
    });

    await queryInterface.bulkInsert('postulaciones', postulaciones);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('postulaciones', null, {});
    await queryInterface.bulkDelete('adoptantes', { nombre: ['Juan Gomez', 'Ana Lopez', 'Carlos Ruiz'] });
    await queryInterface.bulkDelete('animales', { nombre: ['Michi', 'Rocky', 'Luna', 'Toby'] });
  },
};
