// =========================================================
// services/postService.js
// Capa de datos PURA para todo lo relacionado a publicaciones.
// =========================================================

const pool = require('../config/db');

/**
 * Devuelve todas las publicaciones para armar el feed global,
 * incluyendo el nombre de usuario y foto del autor (JOIN).
 */
async function obtenerFeedGlobal() {
  const query = `
    SELECT p.id, p.url_imagen, p.descripcion, p.likes, p.fecha_creacion,
           u.id AS usuario_id, u.nombre_usuario, u.foto_perfil
    FROM publicaciones p
    INNER JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY p.fecha_creacion DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

/**
 * Inserta una nueva publicación asociada a un usuario autenticado.
 */
async function crearPublicacion({ usuarioId, urlImagen, descripcion }) {
  const query = `
    INSERT INTO publicaciones (usuario_id, url_imagen, descripcion)
    VALUES ($1, $2, $3)
    RETURNING id, usuario_id, url_imagen, descripcion, likes, fecha_creacion
  `;
  const { rows } = await pool.query(query, [usuarioId, urlImagen, descripcion]);
  return rows[0];
}

module.exports = {
  obtenerFeedGlobal,
  crearPublicacion,
};
