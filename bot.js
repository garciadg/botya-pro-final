import pkg from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import config from './config.js';
import gptRespuesta from './gpt-autorespuesta.js';

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = pkg;
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
      const menu = `🤖 *BotYa Paraguay* te da la bienvenida\n\nAutomatizá tu negocio con IA:\n✅ Vendé\n✅ Atendé\n✅ Agendá 24/7\n\n📍Elegí una opción:\n1️⃣ Ver precios\n2️⃣ Agendar cita\n3️⃣ Hablar con asesor\n\nEscribí el número de la opción.`;
      await sock.sendMessage(id, { text: menu });
      return;
    }

    const respuesta = await gptRespuesta(texto);
    await sock.sendMessage(id, { text: respuesta });
    fs.appendFileSync('log.txt', `${new Date().toISOString()} - ${id} -> ${texto}\n`);
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

