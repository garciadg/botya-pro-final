const express = require('express');
const axios = require('axios');
const path = require('path');

const ZAPI_TOKEN = "TU_TOKEN_DE_ZAPI"; // reemplazá por el real
const INSTANCE_ID = "YOUR_INSTANCE_ID"; // reemplazá por el real

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Landing visual
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// Webhook de mensajes
app.post("/webhook", async (req, res) => {
  const msg = req.body;
  const numero = msg?.message?.from;
  const texto = msg?.message?.text?.body?.toLowerCase() || "";

  if (!numero || texto === "") return res.sendStatus(200);

  let respuesta = "";

  if (texto.includes("1")) {
    respuesta = "✅ Para activar tu bot, completá el formulario o escribinos por aquí. Pronto recibirás tu licencia.";
  } else if (texto.includes("2")) {
    respuesta = "💰 Nuestros planes:\n🔹 Básico: Gs. 99.000/mes\n🔹 Pro: Gs. 199.000/mes con menú y base de datos.";
  } else if (texto.includes("3")) {
    respuesta = "📞 Un asesor se comunicará con vos en breve. También podés escribir al 0994-882364.";
  } else {
    respuesta = "🤖 Bienvenido a *BotYa Paraguay*.\n¿Qué querés hacer?\n\n1️⃣ Activar mi bot\n2️⃣ Ver precios\n3️⃣ Hablar con soporte";
  }

  try {
    await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`, {
      phone: numero,
      message: respuesta
    });
    console.log("✅ Respondido a", numero);
  } catch (error) {
    console.error("❌ Error al responder:", error.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 BotYa Paraguay activo en Railway (puerto ${PORT})`);
});

