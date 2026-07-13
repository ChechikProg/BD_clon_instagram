// =========================================================
// services/userService.js
// Capa de datos PURA: solo se comunica con la base de datos.
// No conoce req/res ni nada del mundo HTTP.
// =========================================================

const pool = require('../config/db');

/**
 * Busca un usuario por email o nombre_usuario.
 * Se usa en el registro (para chequear duplicados) y en el login.
 */
async function buscarPorEmailOUsuario(email, nombreUsuario) {
  const query = `
    SELECT * FROM usuarios
    WHERE email = $1 OR nombre_usuario = $2
  `;
  const { rows } = await pool.query(query, [email, nombreUsuario]);
  return rows[0]; // undefined si no existe
}

/**
 * Busca un usuario únicamente por email (usado en el login).
 */
async function buscarPorEmail(email) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return rows[0];
}

/**
 * Crea un nuevo usuario en la base de datos.
 * La contraseña ya debe llegar hasheada (bcrypt) desde el controller.
 */
async function crearUsuario({ nombreUsuario, nombreCompleto, email, passwordHash }) {
  const query = `
    INSERT INTO usuarios (nombre_usuario, nombre_completo, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre_usuario, nombre_completo, email, foto_perfil, biografia, fecha_creacion
  `;
  const { rows } = await pool.query(query, [nombreUsuario, nombreCompleto, email, passwordHash]);
  return rows[0];
}

/**
 * Obtiene el perfil completo de un usuario (sin password) por su id.
 */
async function obtenerPerfilPorId(id) {
  const query = `
    SELECT id, nombre_usuario, nombre_completo, email, foto_perfil, biografia, fecha_creacion
    FROM usuarios
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

/**
 * Obtiene las publicaciones asociadas a un usuario (para armar su perfil).
 */
async function obtenerPublicacionesDeUsuario(id) {
  const query = `
    SELECT id, url_imagen, descripcion, likes, fecha_creacion
    FROM publicaciones
    WHERE usuario_id = $1
    ORDER BY fecha_creacion DESC
  `;
  const { rows } = await pool.query(query, [id]);
  return rows;
}

/**
 * Actualiza biografía, nombre completo y/o foto de perfil del usuario.
 * Usa COALESCE para que, si algún campo no viene, se mantenga el valor actual.
 */
async function actualizarPerfil(id, { nombreCompleto, biografia, fotoPerfil }) {
  const query = `
    UPDATE usuarios
    SET nombre_completo = COALESCE($1, nombre_completo),
        biografia       = COALESCE($2, biografia),
        foto_perfil     = COALESCE($3, foto_perfil)
    WHERE id = $4
    RETURNING id, nombre_usuario, nombre_completo, email, foto_perfil, biografia
  `;
  const { rows } = await pool.query(query, [nombreCompleto, biografia, fotoPerfil, id]);
  return rows[0];
}

module.exports = {
  buscarPorEmailOUsuario,
  buscarPorEmail,
  crearUsuario,
  obtenerPerfilPorId,
  obtenerPublicacionesDeUsuario,
  actualizarPerfil,
};
