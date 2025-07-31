const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');
const fs = require('fs');
const licencias = require('./licencias.json');
const respuestasGPT = require('./gpt-autorespuesta');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// 🧠 Token del bot (copialo desde BotFather o config.js)
const TELEGRAM_TOKEN = '8151907733:AAHDUKZL0h_jBOZ0nq7B9TlPhBvteJpeq4U';
const bot = new Telegraf(TELEGRAM_TOKEN);

// 🌐 Página visual
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// 📝 Logger simple
function log(texto) {
  const now = new Date().toISOString();
  fs.appendFileSync('log.txt', `[${now}] ${texto}\n`);
}

// 🤖 Inicia el bot
bot.start((ctx) => {
  const nombre = ctx.from.first_name || "Cliente";
  const telefono = String(ctx.from.id);

  const licencia = licencias.find(l => l.telefono === telefono && l.activo);

  if (!licencia) {
    ctx.reply("❌ No estás autorizado. Escribí a soporte para obtener tu licencia.");
    log(`⛔ Intento no autorizado: ${telefono}`);
    return;
  }

  ctx.reply(`👋 ¡Hola ${nombre}!\nBienvenido a *BotYa Paraguay*\n\n¿Qué querés hacer?\n\n1️⃣ Activar mi bot\n2️⃣ Ver precios\n3️⃣ Hablar con soporte`);
  log(`✅ Acceso autorizado: ${telefono}`);
});

// 🧾 Opción 1 - Activar
bot.hears('1', (ctx) => {
  ctx.reply('✅ Para activar tu bot, completá el formulario o escribinos por acá. Pronto recibirás tu licencia.');
});

// 💰 Opción 2 - Precios
bot.hears('2', (ctx) => {
  ctx.reply('💰 El precio es 250.000 Gs/mes con instalación gratuita y soporte.');
});

// 📞 Opción 3 - Soporte
bot.hears('3', (ctx) => {
  ctx.reply('📲 Contactanos al WhatsApp: +595994882364 o seguí escribiendo por acá.');
});

// ✨ GPT o respuestas automáticas
bot.on('text', (ctx) => {
  const texto = ctx.message.text.toLowerCase();
  const telefono = String(ctx.from.id);

  respuestasGPT(texto).then((respuesta) => {
    ctx.reply(respuesta);
    log(`📩 GPT ${telefono}: ${texto} => ${respuesta}`);
  });
});

// 🚀 Ejecutar servidor y bot
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web activa en http://localhost:${PORT}`);
});
bot.launch();
console.log('🤖 Bot de Telegram lanzado');

