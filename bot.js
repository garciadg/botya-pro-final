const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

function logEvento(msg) {
  const linea = `[${new Date().toLocaleString()}] ${msg}\n`;
  fs.appendFileSync('log.txt', linea);
}

const licencia = process.argv[2];
if (!licencia) {
  logEvento("❌ Licencia no proporcionada.");
  process.exit(1);
}

const clienteId = licencia.split('-')[0];
const clientePath = path.join(__dirname, 'clientes', `${clienteId}.json`);

if (!fs.existsSync(clientePath)) {
  logEvento(`❌ Cliente no encontrado: ${clienteId}`);
  process.exit(1);
}

const qrPath = path.join(__dirname, 'clientes', `${clienteId}_qr.png`);
qrcode.toFile(qrPath, licencia, err => {
  if (err) {
    logEvento(`❌ Error al generar QR: ${err.message}`);
    process.exit(1);
  } else {
    logEvento(`✅ QR generado correctamente para ${clienteId}`);
    logEvento(`🤖 GPT respuesta simulada: ¡Hola! ¿Cómo puedo ayudarte hoy?`);
  }
});