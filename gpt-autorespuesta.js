import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function gptRespuesta(texto) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: texto }],
    model: 'gpt-4'
  });

  return chatCompletion.choices[0].message.content;
}

export default gptRespuesta;
