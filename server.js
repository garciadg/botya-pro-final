const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('BotYa Demo GPT está corriendo.'));
app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
