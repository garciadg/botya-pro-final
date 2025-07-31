const express = require('express');
const axios = require('axios');
const path = require('path');

const ZAPI_TOKEN = "TU_TOKEN_DE_ZAPI"; // Reemplazá por tu token real
const INSTANCE_ID = "YOUR_INSTANCE_ID"; // Reemplazá por tu ID real

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Página principal web
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// Webhook para recibir mensajes desde Z-API
app.post("/webhook", async (req, res) => {
  const msg = req.body;

  const numero = msg?.message?.from;
  const texto = msg?.message?.text?.body?.toLowerCase() || "";

  if (!numero) return res.sendStatus(200);

  // Si no es mensaje de texto
  if (!msg?.message?.text?.body) {
    await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`, {
      phone: numero,
      message: "⚠️ Solo puedo responder a mensajes de texto por ahora. Escribí 1, 2 o 3 para comenzar."
    });
    return res.sendStatus(200);
  }

  let respuesta = "";

  if (texto === "/start" || texto.includes("hola") || texto.includes("bot")) {
    respuesta = "🤖 ¡Bienvenido a *BotYa Paraguay*!\n¿Qué querés hacer?\n\n1️⃣ Activar mi bot\n2️⃣ Ver precios\n3️⃣ Hablar con soporte";
  } else if (texto.includes("1")) {
    respuesta = "✅ Para activar tu bot, completá el formulario o escribinos por aquí. Pronto recibirás tu licencia.";
  } else if (texto.includes("2")) {
    respuesta = "💰 Nuestros planes:\n🔹 Básico: Gs. 99.000/mes\n🔹 Pro: Gs. 199.000/mes con menú, base de datos y asistencia.";
  } else if (texto.includes("3")) {
    respuesta = "📞 Un asesor se comunicará con vos en breve. También podés escribir al +595994882364.";
  } else {
    respuesta = "🤖 No entendí tu mensaje. Por favor, escribí:\n1️⃣ Activar mi bot\n2️⃣ Ver precios\n3️⃣ Hablar con soporte";
  }

  try {
    await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`, {
      phone: numero,
      message: respuesta
    });

    console.log("✅ Respuesta enviada a", numero);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error al responder:", error.message);
    res.sendStatus(500);
  }
});

// Puerto para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 BotYa Paraguay activo en Railway en el puerto ${PORT}`);
});

