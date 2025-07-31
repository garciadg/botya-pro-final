const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');

// Autenticación persistente
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function iniciarBot() {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  // Guardar estado
  sock.ev.on('creds.update', saveState);

  // Escuchar mensajes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (!messages || type !== 'notify') return;

    const msg = messages[0];
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const remitente = msg.key.remoteJid;

    if (!texto) return;

    console.log(`[${remitente}] => ${texto}`);

    let respuesta = "🤖 ¡Hola! Recibimos tu mensaje.";
    if (texto.toLowerCase().includes("precio")) respuesta = "💵 El precio es 250.000 Gs/mes.";
    if (texto.toLowerCase().includes("activar")) respuesta = "✅ Ya estás en nuestra lista de activación.";

    await sock.sendMessage(remitente, { text: respuesta });
  });

  // Detectar desconexiones
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🛑 Conexión cerrada. Reintentando...', shouldReconnect);
      if (shouldReconnect) iniciarBot();
    } else if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp');
    }
  });
}

iniciarBot();

