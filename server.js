const express = require('express');
const axios = require('axios');
const path = require('path');

const ZAPI_TOKEN = "TU_TOKEN_DE_ZAPI"; // Reemplazá por tu token real
const INSTANCE_ID = "YOUR_INSTANCE_ID"; // Reemplazá por tu ID real

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// Webhook para recibir mensajes
app.post("/webhook", async (req, res) => {
  const mensaje = req.body;

  try {
    const numero = mensaje?.message?.from;
    const texto = mensaje?.message?.text?.body?.toLowerCase() || "";

    if (!numero || texto.trim() === "") {
      console.log("📭 Mensaje vacío o no válido recibido.");
      return res.sendStatus(200);
    }

    console.log(`📥 Mensaje de ${numero}: ${texto}`);

    const respuesta = `🤖 Hola, soy *BotYa Paraguay*.\n` +
                      `¿En qué puedo ayudarte?\n\n` +
                      `1️⃣ Activar mi bot\n` +
                      `2️⃣ Ver precios y planes\n` +
                      `3️⃣ Hablar con soporte`;

    await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`, {
      phone: numero,
      message: respuesta
    });

    console.log(`✅ Respuesta enviada a ${numero}`);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en webhook:", error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 BotYa activo en Railway - Puerto ${PORT}`);
});

