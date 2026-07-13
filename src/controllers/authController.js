// =========================================================
// controllers/authController.js
// Maneja la lógica de registro y login. Habla con userService
// para acceder a la base de datos, y devuelve las respuestas HTTP.
// =========================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userService = require('../services/userService');

const SALT_ROUNDS = 10; // Costo del hash de bcrypt

/**
 * POST /api/auth/register
 * Registra un nuevo usuario, verificando que el email/nickname
 * no estén duplicados, y encriptando la contraseña.
 */
async function register(req, res) {
  try {
    const { nombre_usuario, nombre_completo, email, password } = req.body;

    // 1. Verificamos que no exista ya un usuario con ese email o nickname
    const existente = await userService.buscarPorEmailOUsuario(email, nombre_usuario);
    if (existente) {
      return res.status(400).json({ error: 'El email o el nombre de usuario ya están registrados.' });
    }

    // 2. Encriptamos la contraseña antes de guardarla
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Creamos el usuario en la base de datos
    const nuevoUsuario = await userService.crearUsuario({
      nombreUsuario: nombre_usuario,
      nombreCompleto: nombre_completo,
      email,
      passwordHash,
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
  }
}

/**
 * POST /api/auth/login
 * Valida credenciales y devuelve un JWT firmado si son correctas.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Buscamos al usuario por email
    const usuario = await userService.buscarPorEmail(email);
    if (!usuario) {
      // Mensaje genérico a propósito, para no revelar si el email existe o no
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 2. Comparamos la contraseña ingresada contra el hash guardado
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 3. Generamos el token JWT.
    // El payload guarda solo datos NO sensibles: id, nickname y email.
    // Nunca se guarda la contraseña dentro del token.
    const payload = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    return res.status(200).json({
      mensaje: 'Login exitoso.',
      token,
      usuario: payload,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
}

module.exports = { register, login };
