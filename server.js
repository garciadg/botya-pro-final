const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

app.post('/guardar', (req, res) => {
  const { nombre, whatsapp, correo } = req.body;
  if (!nombre || !whatsapp || !correo) {
    return res.status(400).send('Faltan datos del formulario.');
  }

  const clienteId = whatsapp.replace(/\D/g, '');
  const licencia = `${clienteId}-${Date.now()}`;
  const datos = { nombre, whatsapp: `+${clienteId}`, correo, licencia };

  const clientePath = path.join(__dirname, 'clientes');
  if (!fs.existsSync(clientePath)) fs.mkdirSync(clientePath);
  fs.writeFileSync(`${clientePath}/${clienteId}.json`, JSON.stringify(datos, null, 2));

  res.send(`✅ Datos guardados. Licencia: ${licencia}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor activo en http://localhost:${PORT}`);
});
