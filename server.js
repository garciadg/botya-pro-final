const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');
const fs = require('fs');
const licencias = require('./licencias.json');
const respuestasGPT = require('./gpt-autorespuesta');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// 🔐 Token real de tu bot (protegido en producción idealmente)
const TELEGRAM_TOKEN = '8151070733:AAHDUKZL0h_jBOZ0nq709IlpHBvteJpeq4U';
const bot = new Telegraf(TELEGRAM_TOKEN);

// 🌐 Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// 📝 Logger
function log(text) {
  const now = new Date().toISOString();
  fs.appendFileSync('log.txt', `[${now}] ${text}\n`);
}

// 🤖 Inicio del bot
bot.start((ctx) => {
  const nombre = ctx.from.first_name || "Cliente";
  const telefono = String(ctx.from.id);

  const licencia = licencias.find(l => l.telefono === telefono && l.activo);

  if (!licencia) {
    ctx.reply("❌ No estás autorizado. Escribí a soporte para activar tu licencia.");
    log(`⛔ Acceso bloqueado - ID: ${telefono}`);
    return;
  }

  ctx.reply(`👋 ¡Hola ${nombre}!\nBienvenido a *BotYa Paraguay*\n\n¿Qué querés hacer?\n\n1️⃣ Activar mi bot\n2️⃣ Ver precios\n3️⃣ Hablar con soporte`);
  log(`✅ Acceso autorizado: ${telefono}`);
});

// Menú
bot.hears('1', (ctx) => {
  ctx.reply('✅ Para activar tu bot, completá el formulario o escribinos por acá. ¡Gracias!');
});
bot.hears('2', (ctx) => {
  ctx.reply('💰 El precio es 250.000 Gs/mes. Incluye instalación gratuita y soporte.');
});
bot.hears('3', (ctx) => {
  ctx.reply('📲 Escribinos al WhatsApp: +595994882364 o seguí chateando por acá.');
});

// GPT (o respuestas básicas)
bot.on('text', (ctx) => {
  const texto = ctx.message.text.toLowerCase();
  const telefono = String(ctx.from.id);

  respuestasGPT(texto).then((respuesta) => {
    ctx.reply(respuesta);
    log(`💬 ${telefono}: ${texto} => ${respuesta}`);
  });
});

// Iniciar servidor + bot
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web corriendo en http://localhost:${PORT}`);
});
bot.launch();
console.log('🤖 BotYa Paraguay activo en Telegram');

