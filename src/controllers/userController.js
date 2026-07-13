// =========================================================
// controllers/userController.js
// Lógica de negocio relacionada al perfil del usuario autenticado.
// =========================================================

const userService = require('../services/userService');

/**
 * GET /api/usuarios/perfil (RUTA PROTEGIDA)
 * Devuelve los datos del perfil del usuario autenticado,
 * junto con sus publicaciones. El id del usuario sale del
 * token decodificado (req.user.id), no del cliente.
 */
async function obtenerPerfil(req, res) {
  try {
    const usuarioId = req.user.id;

    const perfil = await userService.obtenerPerfilPorId(usuarioId);
    if (!perfil) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const publicaciones = await userService.obtenerPublicacionesDeUsuario(usuarioId);

    return res.status(200).json({
      ...perfil,
      cantidad_publicaciones: publicaciones.length,
      publicaciones,
    });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor al obtener el perfil.' });
  }
}

/**
 * PUT /api/usuarios/perfil (RUTA PROTEGIDA)
 * Permite al usuario autenticado editar su nombre completo,
 * biografía y/o foto de perfil.
 */
async function actualizarPerfil(req, res) {
  try {
    const usuarioId = req.user.id;
    const { nombre_completo, biografia, foto_perfil } = req.body;

    const perfilActualizado = await userService.actualizarPerfil(usuarioId, {
      nombreCompleto: nombre_completo,
      biografia,
      fotoPerfil: foto_perfil,
    });

    return res.status(200).json({
      mensaje: 'Perfil actualizado correctamente.',
      usuario: perfilActualizado,
    });
  } catch (error) {
    console.error('Error en actualizarPerfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
  }
}

module.exports = { obtenerPerfil, actualizarPerfil };
