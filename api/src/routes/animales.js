const express = require('express');
const router = express.Router();
const controller = require('../controllers/animalesController');
const { requireAuth } = require('../middleware/auth');

// RF9: vista pública de solo lectura — sin login
router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);

// RF1, RF3: requieren autenticación del staff
router.post('/', requireAuth, controller.crear);
router.patch('/:id/estado', requireAuth, controller.cambiarEstado);

module.exports = router;
