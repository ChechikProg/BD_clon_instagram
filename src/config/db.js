// =========================================================
// config/db.js
// Configura y exporta el "pool" de conexiones a PostgreSQL.
// Un pool reutiliza conexiones en vez de abrir una nueva
// por cada consulta, lo que mejora el rendimiento.
// =========================================================

const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables desde el archivo .env

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Probamos la conexión al iniciar el servidor, para detectar
// errores de configuración (credenciales, host, etc.) temprano.
pool
  .connect()
  .then((client) => {
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    client.release(); // liberamos el cliente de vuelta al pool
  })
  .catch((err) => {
    console.error('❌ Error al conectar con PostgreSQL:', err.message);
  });

module.exports = pool;
