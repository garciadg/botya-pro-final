const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { Configuration, OpenAIApi } = require("openai");
const Pino = require("pino");
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');

// Autenticación del bot
const { state, saveState } = useSingleFileAuthState(path.resolve(__dirname, 'auth_info.json'));

// Configurar conexión con OpenAI
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

async function runBot() {
  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' || !messages[0]?.message) return;
    const msg = messages[0];
    const from = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    console.log("Mensaje recibido:", text);

    if (text === "1") {
      await sock.sendMessage(from, {
        text: "📌 Esta es una demo de BotYa Paraguay con IA 🤖"
      });
    } else if (text === "2") {
      await sock.sendMessage(from, {
        text: "📱 Contacto: +595 994 882 364"
      });
    } else if (text === "3") {
      await sock.sendMessage(from, {
        text: "🧠 Escribí tu mensaje y te responderé con inteligencia artificial..."
      });
    } else if (text.length > 5) {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }]
      });
      await sock.sendMessage(from, {
        text: completion.data.choices[0].message.content
      });
    } else {
      await sock.sendMessage(from, {
        text: "👋 Bienvenido a BotYa Paraguay.\n\n1 - Información\n2 - Contacto\n3 - Hablar con IA"
      });
    }
  });

  sock.ev.on('creds.update', saveState);
}

runBot();

