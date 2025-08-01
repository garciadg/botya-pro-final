const { default: makeWASocket, useSingleFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { Configuration, OpenAIApi } = require("openai");
const Pino = require("pino");
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');

async function runBot() {
  const { state, saveCreds } = await useSingleFileAuthState('./auth_info.json');

  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];
    const from = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    if (text === "1") {
      await sock.sendMessage(from, { text: "📌 Info BotYa Paraguay" });
    } else if (text === "2") {
      await sock.sendMessage(from, { text: "📱 Contacto: +595 994 882 364" });
    } else if (text === "3") {
      await sock.sendMessage(from, { text: "🧠 Escribí algo y te respondo con IA..." });
    } else if (text.length > 5) {
      const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
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
  });

  sock.ev.on('creds.update', saveCreds);
}

runBot();



