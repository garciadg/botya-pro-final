// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const licencias = require('./licencias.json');
const config = require('./config'); // Trae el token desde config.js

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Inicializa el bot con el token importado
const bot = new Telegraf(process.env.BOT_TOKEN || config.telegramToken);

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Ruta para subir el flyer desde formulario web
app.post('/subir-flyer', (req, res) => {
  const { negocio, imagenBase64 } = req.body;

  if (!negocio || !imagenBase64) {
    return res.status(400).json({ error: 'Faltan datos del formulario.' });
  }

  const nombreArchivo = `clientes/${negocio}-flyer.png`;
  const base64Data = imagenBase64.replace(/^data:image\/png;base64,/, '');

  try {
    fs.writeFileSync(nombreArchivo, base64Data, 'base64');
    res.send({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error al guardar el flyer:', err);
    res.status(500).send({ error: 'No se pudo guardar la imagen.' });
  }
});

// Comando /start en Telegram
bot.start((ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id && l.activo);

  if (!licencia) {
    ctx.reply('❌ Tu bot no está habilitado. Solicitá tu licencia.');
    return;
  }

  ctx.reply(`👋 ¡Bienvenido a BotYa Paraguay, ${licencia.nombreNegocio || 'Negocio'}!
¿Qué deseás hacer?
1️⃣ Enviar flyer
2️⃣ Ver información`);
});

// Opción 1: Enviar flyer
bot.hears('1', (ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id && l.activo);

  if (!licencia || !licencia.nombreNegocio) {
    ctx.reply('❌ No se encontró tu licencia o el nombre del negocio.');
    return;
  }

  const flyerPath = `clientes/${licencia.nombreNegocio}-flyer.png`;

  if (fs.existsSync(flyerPath)) {
    ctx.replyWithPhoto({ source: flyerPath });
  } else {
    ctx.reply('⚠️ Aún no cargaste tu flyer. Usá el formulario web para subirlo.');
  }
});

// Opción 2: Ver nombre del negocio
bot.hears('2', (ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id && l.activo);

  if (!licencia || !licencia.nombreNegocio) {
    ctx.reply('⚠️ No se encontró información de tu negocio.');
  } else {
    ctx.reply(`📌 Nombre de tu negocio: ${licencia.nombreNegocio}`);
  }
});

// Iniciar el bot solo si no está siendo importado
if (!module.parent) {
  bot.launch().catch(err => {
    console.error('❌ Error al iniciar el bot:', err);
  });
}

// Levantar el servidor web
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web disponible en http://localhost:${PORT}`);
});
