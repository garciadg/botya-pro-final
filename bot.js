const express = require('express');
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { Configuration, OpenAIApi } = require("openai");
const Pino = require("pino");
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

// Servidor Express para Railway
const app = express();
app.get('/', (req, res) => {
  res.send('✅ BotYa Demo GPT está corriendo correctamente en Railway.');
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor web en http://localhost:${PORT}`);
});

// Verifica si existe el archivo de auth de WhatsApp
const AUTH_FILE = './auth_info.json';
if (!fs.existsSync(AUTH_FILE)) {
  console.error('❌ No se encontró auth_info.json. Debes ejecutarlo localmente, escanear el QR y subir este archivo.');
  process.exit(1);
}

async function runBot() {
  try {
    const { state, saveCreds } = await useSingleFileAuthState(AUTH_FILE);

    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(config);

    const sock = makeWASocket({
      logger: Pino({ level: 'silent' }),
      printQRInTerminal: false, // No imprimir QR en Railway
      auth: state
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify' || !messages[0]?.message) return;

      const msg = messages[0];
      const from = msg.key.remoteJid;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

      console.log("📩 Mensaje recibido:", text);

      try {
        if (text === "1") {
          await sock.sendMessage(from, { text: "📌 Esta es una demo de BotYa Paraguay con IA 🤖" });
        } else if (text === "2") {
          await sock.sendMessage(from, { text: "📱 Contacto: +595 994 882 364" });
        } else if (text === "3") {
          await sock.sendMessage(from, { text: "🧠 Escribí tu mensaje y te responderé con inteligencia artificial..." });
        } else if (text.length > 5) {
          const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: text }]
          });
          await sock.sendMessage(from, { text: completion.data.choices[0].message.content });
        } else {
          await sock.sendMessage(from, {
            text: "👋 Bienvenido a BotYa Paraguay.\n\n1 - Información\n2 - Contacto\n3 - Hablar con IA"
          });
        }
      } catch (err) {
        await sock.sendMessage(from, { text: "❌ Error procesando tu mensaje. Intenta de nuevo más tarde." });
        console.error('Error con OpenAI o envío de mensaje:', err);
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    console.error('❌ Error inicializando el bot:', err);
  }
}

runBot();

