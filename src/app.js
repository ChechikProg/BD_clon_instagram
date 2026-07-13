// =========================================================
// app.js
// Inicializa la aplicación Express: middlewares globales,
// CORS y el montado de todas las rutas de la API.
// =========================================================

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// --- Middlewares globales ---
app.use(cors());          // Habilita peticiones desde el frontend (otro origen/puerto)
app.use(express.json());  // Permite leer JSON en req.body

// --- Ruta de chequeo rápido ---
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Clon de Instagram funcionando correctamente 🐱' });
});

// --- Montado de rutas ---
// Todo lo relacionado a login/registro cuelga de /api/auth
app.use('/api/auth', authRoutes);

// Todo lo relacionado al perfil del usuario cuelga de /api/usuarios
app.use('/api/usuarios', userRoutes);

// Todo lo relacionado a publicaciones cuelga de /api/publicaciones
app.use('/api/publicaciones', postRoutes);

// --- Manejo de rutas no encontradas (404) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

module.exports = app;
