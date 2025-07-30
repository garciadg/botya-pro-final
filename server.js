const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/clientes', express.static(path.join(__dirname, 'clientes')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'qr.html')));
app.get('/pagar', (req, res) => res.sendFile(path.join(__dirname, 'checkout.html')));

app.post('/guardar', (req, res) => {
  const { nombre, whatsapp, correo } = req.body;
  const id = whatsapp.replace(/\D/g, '');
  const licencia = `${id}-${Date.now()}`;
  const cliente = { nombre, whatsapp, correo, licencia };

  fs.writeFileSync(`./clientes/${id}.json`, JSON.stringify(cliente, null, 2));
  fs.appendFileSync('log.txt', `[${new Date().toISOString()}] Activado ${whatsapp} (${nombre})\n`);

  const proceso = spawn('node', ['bot.js', licencia], { stdio: 'inherit' });
  proceso.on('close', () => fs.appendFileSync('log.txt', `[${new Date().toISOString()}] Bot finalizado para ${id}\n`));

  res.redirect('/qr');
});

app.listen(3000, () => {
  console.log('🌐 Servidor iniciado en http://localhost:3000');
});