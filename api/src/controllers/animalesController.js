const { Animal, Foto, EventoClinico } = require('../models');

// RF4: listar y buscar por estado/especie
async function listar(req, res) {
  try {
    const { estado, especie } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (especie) where.especie = especie;

    const animales = await Animal.findAll({
      where,
      include: [{ model: Foto, as: 'fotos' }],
      order: [['fechaIngreso', 'DESC']],
    });
    res.json(animales);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar animales', detalle: err.message });
  }
}

// RF1: registrar un animal
async function crear(req, res) {
  try {
    const animal = await Animal.create(req.body);
    res.status(201).json(animal);
  } catch (err) {
    res.status(400).json({ error: 'Datos inválidos', detalle: err.message });
  }
}

// Detalle de un animal, incluyendo galería e historia clínica (RF2)
async function obtenerPorId(req, res) {
  try {
    const animal = await Animal.findByPk(req.params.id, {
      include: [
        { model: Foto, as: 'fotos' },
        { model: EventoClinico, as: 'historiaClinica' },
      ],
    });
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el animal', detalle: err.message });
  }
}

// RF3: cambiar estado del animal
async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    const estadosValidos = ['disponible', 'en_tratamiento', 'en_adopcion', 'adoptado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }
    const animal = await Animal.findByPk(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    animal.estado = estado;
    await animal.save();
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: err.message });
  }
}

module.exports = { listar, crear, obtenerPorId, cambiarEstado };
