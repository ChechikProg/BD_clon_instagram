// =========================================================
// middlewares/validationMiddleware.js
// Valida el formato de los datos ANTES de que lleguen a los
// controladores, para evitar procesar peticiones incompletas
// o mal formateadas.
// =========================================================

// Regex simple para validar formato de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los campos requeridos para el registro de usuario.
 */
function validarRegistro(req, res, next) {
  const { nombre_usuario, nombre_completo, email, password } = req.body;

  if (!nombre_usuario || !nombre_completo || !email || !password) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: nombre_usuario, nombre_completo, email, password.',
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'El formato del email no es válido.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  next();
}

/**
 * Valida los campos requeridos para el login.
 */
function validarLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Debe proporcionar email y password.' });
  }

  next();
}

/**
 * Valida los campos requeridos para crear una publicación.
 */
function validarPublicacion(req, res, next) {
  const { url_imagen } = req.body;

  if (!url_imagen) {
    return res.status(400).json({ error: 'El campo url_imagen es obligatorio.' });
  }

  next();
}

module.exports = {
  validarRegistro,
  validarLogin,
  validarPublicacion,
};
