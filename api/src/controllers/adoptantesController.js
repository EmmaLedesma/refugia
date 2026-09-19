const { Adoptante } = require('../models');

// RF5: cuestionario del adoptante — público, lo completa cualquier visitante interesado
async function crear(req, res) {
  try {
    const adoptante = await Adoptante.create(req.body);
    res.status(201).json(adoptante);
  } catch (err) {
    res.status(400).json({ error: 'Datos inválidos', detalle: err.message });
  }
}

// Solo staff — listado de adoptantes registrados
async function listar(req, res) {
  try {
    const adoptantes = await Adoptante.findAll({ order: [['createdAt', 'DESC']] });
    res.json(adoptantes);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar adoptantes', detalle: err.message });
  }
}

module.exports = { crear, listar };
