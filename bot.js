const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const licencia = process.argv[2] || "BOTYA-LICENCIA-DEMO";
const qrPath = path.join(__dirname, 'clientes', 'qr.png');

qrcode.toFile(qrPath, licencia, { width: 300 }, err => {
  if (err) {
    console.error('❌ Error generando QR:', err);
    fs.appendFileSync('log.txt', `[${new Date().toISOString()}] ❌ Error QR\n`);
  } else {
    console.log('✅ QR generado');
    fs.appendFileSync('log.txt', `[${new Date().toISOString()}] ✅ QR generado\n`);
    fs.appendFileSync('log.txt', `[${new Date().toISOString()}] 🤖 GPT respuesta: ¡Hola, cómo puedo ayudarte hoy?\n`);
  }
});