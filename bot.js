const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const OpenAI = require("openai");
const { default: Pino } = require("pino");
const dotenv = require('dotenv');
dotenv.config();

async function runBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: No se encontró OPENAI_API_KEY");
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });


  

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

    console.log("📩 Mensaje recibido:", text);

    try {
      if (text === "1") {
        await sock.sendMessage(from, { text: "📌 Esta es una demo de BotYa Paraguay con IA 🤖" });
      } else if (text === "2") {
        await sock.sendMessage(from, { text: "📱 Contacto: +595 994 882 364" });
      } else if (text === "3") {
        await sock.sendMessage(from, { text: "🧠 Escribí tu pregunta para que la IA responda..." });
      } else if (text.length > 5) {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: text }]
        });
        const response = completion.choices[0].message.content;
        await sock.sendMessage(from, { text: response });
      } else {
        await sock.sendMessage(from, {
          text: "👋 Bienvenido a BotYa Paraguay.\n\n1 - Información\n2 - Contacto\n3 - Hablar con IA"
        });
      }
    } catch (err) {
      await sock.sendMessage(from, { text: "❌ Ocurrió un error al procesar tu mensaje." });
      console.error(err);
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

runBot().catch(err => {
  console.error("❌ Error al iniciar el bot:", err);
});

