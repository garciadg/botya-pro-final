const express = require('express');
const app = express();

// Página principal para comprobar que el servidor funciona
app.get('/', (req, res) => {
  res.send('✅ BotYa Demo GPT está corriendo correctamente.');
});

// Usar el puerto de Railway o 8080 localmente
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor web en http://localhost:${PORT}`);
});

// 🧠 Ejecutar el bot de WhatsApp automáticamente al iniciar el server
require('./bot');
