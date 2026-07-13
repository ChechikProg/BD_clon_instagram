// =========================================================
// routes/authRoutes.js
// Define los endpoints de autenticación (públicos).
// =========================================================

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validarRegistro, validarLogin } = require('../middlewares/validationMiddleware');

// POST /api/auth/register -> Registro de nuevas cuentas
router.post('/register', validarRegistro, authController.register);

// POST /api/auth/login -> Validación de identidad y entrega del token JWT
router.post('/login', validarLogin, authController.login);

module.exports = router;
