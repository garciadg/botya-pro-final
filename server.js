const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.post('/guardar', (req, res) => {
  const { nombre, whatsapp, correo } = req.body;
  if (!nombre || !whatsapp || !correo) {
    return res.status(400).send('Faltan datos del formulario.');
  }

  const clienteId = whatsapp.replace(/\D/g, '');
  const licencia = `${clienteId}-${Date.now()}`;

  const datos = {
    nombre,
    whatsapp: `+${clienteId}`,
    correo,
    licencia
  };

  const clientePath = path.join(__dirname, 'clientes');
  if (!fs.existsSync(clientePath)) fs.mkdirSync(clientePath);
  fs.writeFileSync(`${clientePath}/${clienteId}.json`, JSON.stringify(datos, null, 2));

  res.send(`✅ Datos del cliente guardados. Licencia generada: ${licencia}`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Servidor escuchando en http://localhost:3000');
});