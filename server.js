const express = require('express');
const app = express();

// Ruta principal
app.get('/', (req, res) => {
  res.send('✅ BotYa Demo GPT está corriendo correctamente.');
});

// Puerto para Railway o local
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
