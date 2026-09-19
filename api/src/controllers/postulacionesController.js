const { Postulacion, Animal, Adoptante } = require('../models');
const { calcularScore } = require('../services/matchingService');

// RF7: registrar postulación — público (el visitante postula tras el cuestionario)
async function crear(req, res) {
  try {
    const { animalId, adoptanteId } = req.body;
    if (!animalId || !adoptanteId) {
      return res.status(400).json({ error: 'animalId y adoptanteId son requeridos' });
    }

    const [animal, adoptante] = await Promise.all([
      Animal.findByPk(animalId),
      Adoptante.findByPk(adoptanteId),
    ]);
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });
    if (!adoptante) return res.status(404).json({ error: 'Adoptante no encontrado' });

    const { score, detalle } = calcularScore(animal, adoptante);

    const postulacion = await Postulacion.create({
      animalId,
      adoptanteId,
      scoreMatching: score,
      detalleMatching: detalle,
      fecha: new Date(),
    });

    res.status(201).json(postulacion);
  } catch (err) {
    res.status(400).json({ error: 'Datos inválidos', detalle: err.message });
  }
}

// Solo staff — listado con animal y adoptante incluidos, ordenado por score
async function listar(req, res) {
  try {
    const postulaciones = await Postulacion.findAll({
      include: [{ model: Animal }, { model: Adoptante }],
      order: [['scoreMatching', 'DESC']],
    });
    res.json(postulaciones);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar postulaciones', detalle: err.message });
  }
}

// RF7: staff acepta/rechaza
async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'aceptada', 'rechazada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }
    const postulacion = await Postulacion.findByPk(req.params.id);
    if (!postulacion) return res.status(404).json({ error: 'Postulación no encontrada' });

    postulacion.estado = estado;
    await postulacion.save();
    res.json(postulacion);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: err.message });
  }
}

module.exports = { crear, listar, cambiarEstado };
