const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { default: Pino } = require('pino');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function runBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_cliente');

  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state
  });

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection } = update;

    if (qr) {
      const qrPath = path.join(__dirname, 'public', 'qr.png');
      await qrcode.toFile(qrPath, qr);

      const qrBase64 = await qrcode.toDataURL(qr);
      fs.writeFileSync(path.join(__dirname, 'public', 'qr.txt'), qrBase64);

      console.log("📷 QR generado y disponible en /qr.png");
    }

    if (connection === 'open') {
      console.log("✅ Conexión con WhatsApp establecida.");
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

runBot();
