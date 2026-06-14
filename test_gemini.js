import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 300 },
    });
    
    const sys = `You are CarbonWise Coach, a friendly and knowledgeable carbon footprint expert.
User profile: Diet=omnivore, Transport=car, Recent 7-day average: 4.7 kg CO₂/day.
Today's logged activities (Total CO2: 785.01 kg):
- Transport: [{"id":"1","type":"car","distance":1000,"co2":785.01}]
- Food: []
- Energy: []
- Shopping: []
Be encouraging, specific, and practical. Keep replies under 120 words. Answer questions about the user's data accurately based on the context provided.\n\nConfirm you are ready with a brief greeting.`;

    await chat.sendMessage(sys);
    const result = await chat.sendMessage("What was my biggest carbon source today?");
    console.log("RESPONSE:", result.response.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();
