const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('✅ BotYa Demo GPT está corriendo correctamente.');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor web en http://localhost:${PORT}`);
});
