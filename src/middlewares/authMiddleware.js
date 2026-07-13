// =========================================================
// middlewares/authMiddleware.js
// Intercepta las peticiones a rutas protegidas y valida
// el token JWT enviado en el header Authorization.
// =========================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  // El header esperado tiene el formato: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó un token de autenticación.' });
  }

  const partes = authHeader.split(' ');

  // Validamos que el formato sea exactamente "Bearer <token>"
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = partes[1];

  try {
    // jwt.verify lanza una excepción si el token es inválido o expiró
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntamos los datos decodificados del usuario a la request
    // para que los controladores puedan usarlos (req.user.id, etc.)
    req.user = payload;

    next(); // El token es válido: dejamos pasar la petición
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = verificarToken;
