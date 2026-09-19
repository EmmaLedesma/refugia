const express = require('express');
const router = express.Router();
const controller = require('../controllers/postulacionesController');
const { requireAuth } = require('../middleware/auth');

// RF7: público — el visitante postula tras completar el cuestionario
router.post('/', controller.crear);

// Solo staff
router.get('/', requireAuth, controller.listar);
router.patch('/:id/estado', requireAuth, controller.cambiarEstado);

module.exports = router;
