const express = require('express');
const app = express();

// Ruta principal
app.get('/', (req, res) => {
  res.send('✅ BotYa Demo GPT está corriendo correctamente.');
});

// Puerto compatible con Railway (usa el asignado o 8080 como fallback)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor en marcha en http://localhost:${PORT}`);
});
