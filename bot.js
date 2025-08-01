// 📦 DEPENDENCIAS
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');

// 🗂️ AUTENTICACIÓN (guarda sesión)
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// 🚀 FUNCIÓN PRINCIPAL
async function iniciarBot() {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true, // Muestra el código QR en consola
    auth: state
  });

  // 🧠 GUARDAR CREDENCIALES
  sock.ev.on('creds.update', saveState);

  // 📩 ESCUCHAR MENSAJES
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' || !messages || !messages[0]) return;

    const msg = messages[0];
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const remitente = msg.key.remoteJid;

    if (!texto) return;

    console.log(`📨 Mensaje recibido de ${remitente}: ${texto}`);

    // 💬 RESPONDER A MENSAJE
    if (texto.toLowerCase() === 'hola') {
      await sock.sendMessage(remitente, { text: '👋 ¡Hola! Bienvenido a BotYa Paraguay por WhatsApp 🚀' });
    } else if (texto === '1') {
      await sock.sendMessage(remitente, { text: '📸 Aún no cargaste tu flyer.' });
    } else if (texto === '2') {
      await sock.sendMessage(remitente, { text: '📌 Tu negocio: BotYa Paraguay' });
    } else {
      await sock.sendMessage(remitente, { text: '❓ Escribí "hola", "1" o "2".' });
    }
  });

  // 🔁 RECONEXIÓN SI SE DESCONECTA
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const motivo = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (motivo === DisconnectReason.loggedOut) {
        console.log('🔒 Sesión cerrada. Escaneá el código QR nuevamente.');
        fs.unlinkSync('./auth_info.json'); // Borra sesión para forzar reautenticación
        iniciarBot(); // Reinicia bot
      } else {
        console.log('🔁 Reconectando...');
        iniciarBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot conectado exitosamente a WhatsApp.');
    }
  });
}

iniciarBot();

