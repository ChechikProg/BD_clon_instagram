// =========================================================
// routes/userRoutes.js
// Define los endpoints relacionados al usuario/perfil.
// Ambos endpoints son PROTEGIDOS: requieren un token válido.
// =========================================================

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const verificarToken = require('../middlewares/authMiddleware');

// GET /api/usuarios/perfil -> Devuelve el perfil del usuario autenticado
router.get('/perfil', verificarToken, userController.obtenerPerfil);

// PUT /api/usuarios/perfil -> Edita biografía, nombre completo o foto
router.put('/perfil', verificarToken, userController.actualizarPerfil);

module.exports = router;
