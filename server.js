const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ZAPI_TOKEN = "TU_TOKEN_DE_ZAPI"; // 🔁 Reemplazá con tu token real
const INSTANCE_ID = "YOUR_INSTANCE_ID"; // 🔁 Reemplazá con tu ID real

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

app.post("/webhook", async (req, res) => {
  const mensaje = req.body;
  if (!mensaje || !mensaje.message || !mensaje.message.from) return res.sendStatus(200);

  const numero = mensaje.message.from;
  const texto = mensaje.message.text.body.toLowerCase();

  let respuesta = "🤖 Hola, soy BotYa Paraguay. ¿En qué puedo ayudarte?\n";
  respuesta += "1️⃣ Activar mi bot\n";
  respuesta += "2️⃣ Precios y planes\n";
  respuesta += "3️⃣ Hablar con soporte";

  try {
    await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`, {
      phone: numero,
      message: respuesta
    });
  } catch (error) {
    console.error("❌ Error al responder:", error.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 BotYa ZAPI activo en http://localhost:${PORT}`);
});
