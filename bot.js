const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState("./session.json");

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ["BotYa Paraguay", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("⛔ Conexión cerrada. Reconectando...", shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("🟢 BotYa conectado a WhatsApp");
    }
  });

  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const texto = m.message.conversation || m.message.extendedTextMessage?.text;

    if (texto) {
      console.log(`📩 Mensaje recibido de ${from}: ${texto}`);

      const respuesta = `🤖 Hola, soy BotYa Paraguay. ¿En qué puedo ayudarte?\n` +
                        `1️⃣ Activar mi bot\n` +
                        `2️⃣ Precios y planes\n` +
                        `3️⃣ Hablar con un humano`;

      await sock.sendMessage(from, { text: respuesta });
    }
  });
}

startBot();
