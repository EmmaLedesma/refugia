const express = require('express');
const router = express.Router();
const controller = require('../controllers/adoptantesController');
const { requireAuth } = require('../middleware/auth');

// RF5: público — cualquier visitante puede completar el cuestionario
router.post('/', controller.crear);

// Solo staff
router.get('/', requireAuth, controller.listar);

module.exports = router;
