/**
 * Calcula un score de compatibilidad (0-100) entre un animal y un adoptante.
 * MVP: scoring por reglas ponderadas. Diseñado para que en Fase 2 (roadmap)
 * se pueda reemplazar por un modelo de ML sin cambiar el modelo de datos —
 * ver docs/data-model.md, sección "Nota sobre atributos de matching".
 *
 * @param {Animal} animal
 * @param {Adoptante} adoptante
 * @returns {{ score: number, detalle: object }}
 */
function calcularScore(animal, adoptante) {
  const detalle = {};
  let puntos = 0;
  const PUNTOS_MAX = 100;
  const pesos = {
    energiaVsActividad: 25,
    espacioVsTamaño: 25,
    niños: 20,
    otrosAnimales: 20,
    tiempoDisponible: 10,
  };

  // Energía del animal vs. actividad deseada por el adoptante
  if (animal.nivelEnergia && adoptante.nivelActividadDeseado) {
    const compatible = animal.nivelEnergia === adoptante.nivelActividadDeseado;
    detalle.energiaVsActividad = compatible ? 'compatible' : 'requiere evaluación';
    if (compatible) puntos += pesos.energiaVsActividad;
  }

  // Tamaño del animal vs. tipo de vivienda/espacio
  if (animal.tamaño && adoptante.tipoVivienda) {
    const espacioChico = adoptante.tipoVivienda === 'departamento';
    const animalGrande = animal.tamaño === 'grande';
    const compatible = !(espacioChico && animalGrande);
    detalle.espacioVsTamaño = compatible ? 'compatible' : 'espacio posiblemente insuficiente';
    if (compatible) puntos += pesos.espacioVsTamaño;
  }

  // Niños en el hogar
  if (animal.aptoNiños !== 'desconocido') {
    const compatible = !adoptante.tieneNiños || animal.aptoNiños === 'si';
    detalle.niños = compatible ? 'compatible' : 'el animal no es apto con niños';
    if (compatible) puntos += pesos.niños;
  }

  // Otros animales en el hogar
  if (animal.aptoOtrosAnimales !== 'desconocido') {
    const compatible = !adoptante.tieneOtrosAnimales || animal.aptoOtrosAnimales === 'si';
    detalle.otrosAnimales = compatible ? 'compatible' : 'el animal no es apto con otros animales';
    if (compatible) puntos += pesos.otrosAnimales;
  }

  // Tiempo disponible (umbral simple para el MVP)
  if (adoptante.tiempoDisponibleHorasDia != null) {
    const compatible = adoptante.tiempoDisponibleHorasDia >= 2;
    detalle.tiempoDisponible = compatible ? 'compatible' : 'tiempo disponible bajo';
    if (compatible) puntos += pesos.tiempoDisponible;
  }

  return { score: Math.min(puntos, PUNTOS_MAX), detalle };
}

module.exports = { calcularScore };
