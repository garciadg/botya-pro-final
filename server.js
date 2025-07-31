const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// TOKEN del bot de Telegram (REAL)
const TELEGRAM_TOKEN = '8151070733:AAHDUKZL0h_jBOZ0nq709IlpHBvteJpeq4U';
const bot = new Telegraf(TELEGRAM_TOKEN);

// Página visual
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Lógica del bot
bot.start((ctx) => {
  ctx.reply(`🤖 Bienvenido a *BotYa Paraguay*
¿Qué querés hacer?

1️⃣ Activar mi bot
2️⃣ Ver precios
3️⃣ Hablar con soporte`);
});

bot.hears(/1/, (ctx) => {
  ctx.reply('✅ Para activar tu bot, completá el formulario o escribinos por aquí. Pronto recibirás tu licencia.');
});

bot.hears(/2/, (ctx) => {
  ctx.reply(`💰 Nuestros planes:
🔹 Básico: Gs. 99.000/mes
🔹 Pro: Gs. 199.000/mes con menú y base de datos.`);
});

bot.hears(/3/, (ctx) => {
  ctx.reply('📞 Un asesor se comunicará con vos en breve. También podés escribir al 0994-882364.');
});

bot.hears(/hola|hola bot|hi|hello/i, (ctx) => {
  ctx.reply(`Hola 👋 Escribí 1, 2 o 3 para avanzar:

1️⃣ Activar mi bot
2️⃣ Ver precios
3️⃣ Hablar con soporte`);
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 BotYa Telegram corriendo en puerto ${PORT}`);
});

