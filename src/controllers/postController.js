// =========================================================
// controllers/postController.js
// Lógica de negocio relacionada a las publicaciones (posts).
// =========================================================

const postService = require('../services/postService');

/**
 * GET /api/publicaciones (RUTA PÚBLICA)
 * Devuelve el feed global de publicaciones para el home.
 */
async function obtenerFeed(req, res) {
  try {
    const publicaciones = await postService.obtenerFeedGlobal();
    return res.status(200).json(publicaciones);
  } catch (error) {
    console.error('Error en obtenerFeed:', error);
    return res.status(500).json({ error: 'Error interno del servidor al obtener el feed.' });
  }
}

/**
 * POST /api/publicaciones (RUTA PROTEGIDA)
 * Crea una nueva publicación asociada al usuario autenticado.
 * El usuario_id se toma del token (req.user.id), NUNCA del body,
 * para evitar que alguien publique en nombre de otro usuario.
 */
async function crearPublicacion(req, res) {
  try {
    const usuarioId = req.user.id;
    const { url_imagen, descripcion } = req.body;

    const nuevaPublicacion = await postService.crearPublicacion({
      usuarioId,
      urlImagen: url_imagen,
      descripcion,
    });

    return res.status(201).json({
      mensaje: 'Publicación creada correctamente.',
      publicacion: nuevaPublicacion,
    });
  } catch (error) {
    console.error('Error en crearPublicacion:', error);
    return res.status(500).json({ error: 'Error interno del servidor al crear la publicación.' });
  }
}

module.exports = { obtenerFeed, crearPublicacion };
