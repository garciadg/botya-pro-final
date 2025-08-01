const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function gptRespuesta(texto) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: texto }]
  });
  return completion.data.choices[0].message.content;
}

module.exports = gptRespuesta;