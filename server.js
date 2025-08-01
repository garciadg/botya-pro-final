const express = require('express');
const path = require('path');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const licencias = require('./licencias.json');
const config = require('./config'); // contiene el token del bot

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// 🔐 Cargar token desde Railway o config.js
const bot = new Telegraf(process.env.BOT_TOKEN || config.telegramToken);

// 🏠 Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// 📤 Ruta para subir el flyer desde formulario web
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
    console.log(`✅ Flyer guardado: ${nombreArchivo}`);
  } catch (err) {
    console.error('❌ Error al guardar el flyer:', err);
    res.status(500).send({ error: 'No se pudo guardar la imagen.' });
  }
});

// 🤖 Comando /start
bot.start((ctx) => {
  const id = String(ctx.from.id);
  console.log("📩 Recibí /start de ID:", id);

  const licencia = licencias.find(l => l.id === id && l.activo);

  if (!licencia) {
    ctx.reply('❌ Tu bot no está habilitado. Solicitá tu licencia.');
    console.log("⛔ Usuario no autorizado:", id);
    return;
  }

  ctx.reply(`👋 ¡Bienvenido a BotYa Paraguay, ${licencia.nombreNegocio || 'Negocio'}!
¿Qué deseás hacer?
1️⃣ Enviar flyer
2️⃣ Ver información`);
  console.log("✅ Menú enviado al usuario:", licencia.nombreNegocio);
});

// 📸 Comando "1" - Enviar flyer
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
    console.log(`📨 Flyer enviado: ${flyerPath}`);
  } else {
    ctx.reply('⚠️ Aún no cargaste tu flyer. Usá el formulario web para subirlo.');
    console.log('⚠️ Flyer no encontrado:', flyerPath);
  }
});

// ℹ️ Comando "2" - Ver información
bot.hears('2', (ctx) => {
  const id = String(ctx.from.id);
  const licencia = licencias.find(l => l.id === id && l.activo);

  if (!licencia || !licencia.nombreNegocio) {
    ctx.reply('⚠️ No se encontró información de tu negocio.');
  } else {
    ctx.reply(`📌 Nombre de tu negocio: ${licencia.nombreNegocio}`);
    console.log(`ℹ️ Información enviada: ${licencia.nombreNegocio}`);
  }
});

// 🟢 Iniciar el bot
bot.launch()
  .then(() => {
    console.log('🤖 Bot iniciado correctamente.');
  })
  .catch(err => {
    if (err.description?.includes('getUpdates')) {
      console.error('⚠️ El bot ya se está ejecutando en otro lugar. Cerralo antes de iniciar uno nuevo.');
    } else {
      console.error('❌ Error al iniciar el bot:', err);
    }
  });

// 🌐 Iniciar servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web disponible en http://localhost:${PORT}`);
});
