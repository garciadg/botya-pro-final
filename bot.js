const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { Configuration, OpenAIApi } = require("openai");
const Pino = require("pino");
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');

async function runBot() {
  // Autenticación de WhatsApp con credenciales en archivo único
  const { state, saveCreds } = await useSingleFileAuthState('./auth_info.json');

  // Configuración de OpenAI con clave del archivo .env
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const openai = new OpenAIApi(config);

  // Crear socket WhatsApp
  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  // Escuchar mensajes entrantes
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
    } catch (error) {
      console.error("❌ Error al procesar el mensaje:", error);
      await sock.sendMessage(from, { text: "⚠️ Ocurrió un error al procesar tu mensaje." });
    }
  });

  // Guardar credenciales actualizadas
  sock.ev.on('creds.update', saveCreds);
}

// Ejecutar el bot
runBot();
