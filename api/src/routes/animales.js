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

// RF2: historia clínica
router.get('/:id/eventos-clinicos', controller.listarEventosClinicos);
router.post('/:id/eventos-clinicos', requireAuth, controller.crearEventoClinico);

// RF10: fotos — upload real vía presigned URL (solo staff)
router.post('/:id/fotos/presign', requireAuth, controller.presignFoto);
router.post('/:id/fotos', requireAuth, controller.agregarFoto);

module.exports = router;
