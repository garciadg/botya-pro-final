const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor web en http://localhost:${PORT}`);
});

try {
  require('./bot');
  console.log('🤖 Bot de WhatsApp iniciado correctamente.');
} catch (err) {
  console.error('❌ Error al iniciar el bot de WhatsApp:', err);
}
