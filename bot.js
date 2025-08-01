const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const config = require('./config');
const gptRespuesta = require('./gpt-autorespuesta');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function conectarBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const id = msg.key.remoteJid;
    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    console.log(`💬 Mensaje de ${id}: ${texto}`);

    if (texto.toLowerCase().includes('hola')) {
      const menu = `🤖 *BotYa Paraguay* te da la bienvenida

Automatizá tu negocio con IA:
✅ Vendé
✅ Atendé
✅ Agendá 24/7

📍Elegí una opción:
1️⃣ Ver precios
2️⃣ Agendar cita
3️⃣ Hablar con asesor

Escribí el número de la opción.`;
      await sock.sendMessage(id, { text: menu });
      return;
    }

    const respuesta = await gptRespuesta(texto);
    await sock.sendMessage(id, { text: respuesta });
    fs.appendFileSync('log.txt', `${new Date().toISOString()} - ${id} -> ${texto}
`);
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        conectarBot();
      } else {
        console.log('❌ Se cerró la sesión');
      }
    } else if (connection === 'open') {
      console.log('✅ BotYa Paraguay está conectado');
    }
  });
}

conectarBot();