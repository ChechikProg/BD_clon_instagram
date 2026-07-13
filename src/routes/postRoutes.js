// =========================================================
// routes/postRoutes.js
// Define los endpoints de publicaciones.
// GET es público (feed), POST es protegido (crear post).
// =========================================================

const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const verificarToken = require('../middlewares/authMiddleware');
const { validarPublicacion } = require('../middlewares/validationMiddleware');

// GET /api/publicaciones -> Feed público con todas las publicaciones
router.get('/', postController.obtenerFeed);

// POST /api/publicaciones -> Crear publicación (requiere estar logueado)
router.post('/', verificarToken, validarPublicacion, postController.crearPublicacion);

module.exports = router;
