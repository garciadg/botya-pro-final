// 📁 ARCHIVO: server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const config = require('./config');
const licencias = require('./licencias.json');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const bot = new Telegraf("8151070733:AAHDUKZL0h_jBOZ0nq709IlpHBvteJpeq4U");

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Guardar flyers
app.post('/subir-flyer', (req, res) => {
  const { negocio, imagenBase64 } = req.body;
  const nombreArchivo = `clientes/${negocio}-flyer.png`;
  const base64Data = imagenBase64.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(nombreArchivo, base64Data, 'base64');
  res.send({ status: 'ok' });
});

// Lógica Telegram
bot.start((ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id && l.activo);

  if (!licencia) {
    ctx.reply('❌ Tu bot no está habilitado. Solicitá tu licencia.');
    return;
  }

  ctx.reply(`👋 Bienvenido a BotYa Paraguay, ${licencia.nombreNegocio || 'Negocio'}.
¿Qué deseás hacer?
1️⃣ Enviar flyer
2️⃣ Ver información`);
});

bot.hears('1', (ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id);
  const flyerPath = `clientes/${licencia.nombreNegocio}-flyer.png`;
  if (fs.existsSync(flyerPath)) {
    ctx.replyWithPhoto({ source: flyerPath });
  } else {
    ctx.reply('⚠️ Aún no cargaste tu flyer. Usá el formulario web.');
  }
});

bot.hears('2', (ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id);
  ctx.reply(`📌 Nombre de tu negocio: ${licencia.nombreNegocio}`);
});

bot.launch();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web disponible en http://localhost:${PORT}`);
});

