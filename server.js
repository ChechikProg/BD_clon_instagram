// =========================================================
// server.js
// Punto de entrada del proyecto. Levanta el servidor HTTP
// usando la app de Express configurada en src/app.js.
// =========================================================

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
