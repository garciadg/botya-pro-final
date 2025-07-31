const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');

// Estado de sesión (se guarda en archivo local)
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function iniciarBot() {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  // Guardar credenciales
  sock.ev.on('creds.update', saveState);

  // Escuchar mensajes entrantes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' || !messages || !messages[0]) return;

    const msg = messages[0];
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const remitente = msg.key.remoteJid;

    if (!texto) return;

    console.log(`[${remitente}] → ${texto}`);

    let respuesta = "🤖 Hola, soy BotYa Paraguay. ¿Cómo puedo ayudarte?";
    if (texto.toLowerCase().includes("precio")) {
      respuesta = "💵 El precio es 250.000 Gs por mes con instalación gratuita.";
    } else if (texto.toLowerCase().includes("activar")) {
      respuesta = "✅ Ya estás registrado. Pronto activaremos tu licencia.";
    }

    await sock.sendMessage(remitente, { text: respuesta });
  });

  // Manejar conexión cerrada o errores
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const debeReconectar = (lastDisconnect.error instanceof Boom) &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      console.log("⛔ Bot desconectado. ¿Reconectar?", debeReconectar);

      if (debeReconectar) iniciarBot();
    }

    if (connection === 'open') {
      console.log("✅ BotYa Paraguay conectado correctamente a WhatsApp");
    }
  });
}

iniciarBot();

