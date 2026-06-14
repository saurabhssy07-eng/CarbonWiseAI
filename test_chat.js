import { GoogleGenerativeAI } from '@google/generative-ai';
import { EMISSION_FACTORS } from './src/utils/co2Constants.js';

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

const todayLog = {
  totalCO2: 20.56,
  transport: [{ type: "car_petrol", distance: 10 }], // 2.10
  food: [{ type: "beef", quantity: 2 }], // 6.60
  energy: [{ type: "electricity", amount: 8 }], // 1.86
  shopping: [{ type: "clothing", quantity: 1 }], // 10.0
};

function enrichLog(entries, category) {
  if (!entries || !entries.length) return [];
  return entries.map(e => {
     const factor = EMISSION_FACTORS[category][e.type]?.factor ?? 0;
     const val = e.distance || e.amount || e.quantity || (category === 'food' ? 1 : 0);
     return { ...e, co2_kg: Number((factor * val).toFixed(2)) };
  });
}

let todayContext = "The user has not logged any activities for today yet.";
if (todayLog) {
  todayContext = `Today's logged activities (Total CO2: ${todayLog.totalCO2?.toFixed(2) ?? 0} kg):
- Transport: ${JSON.stringify(enrichLog(todayLog.transport, 'transport'))}
- Food: ${JSON.stringify(enrichLog(todayLog.food, 'food'))}
- Energy: ${JSON.stringify(enrichLog(todayLog.energy, 'energy'))}
- Shopping: ${JSON.stringify(enrichLog(todayLog.shopping, 'shopping'))}`;
}

const systemContext = `You are CarbonWise Coach, a friendly and knowledgeable carbon footprint expert.
User profile: Diet=omnivore, 
Transport=car,
Recent 7-day average: 4.7 kg CO₂/day.

${todayContext}

Be encouraging, specific, and practical. Keep replies under 120 words. Use emojis sparingly. Answer questions about the user's data accurately based on the context provided.
CRITICAL RULE: DO NOT invent, assume, or hallucinate any details about the user's profile (like claiming they are vegan) unless it is explicitly stated in the User profile line above.`;

async function run() {
  const chatSession = model.startChat({ history: [] });
  
  console.log("Sending System Prompt...");
  try {
    const r1 = await chatSession.sendMessage(systemContext + '\n\nConfirm you are ready with a brief greeting.');
    console.log("AI:", r1.response.text());
  } catch(e) {
    console.error("Error 1:", e);
  }

  console.log("\nSending Msg 1...");
  try {
    const r2 = await chatSession.sendMessage("What was my biggest carbon source today?");
    console.log("AI:", r2.response.text());
  } catch(e) {
    console.error("Error 2:", e);
  }

  console.log("\nSending Msg 2...");
  try {
    const r3 = await chatSession.sendMessage("Break down all my emissions today by category.");
    console.log("AI:", r3.response.text());
  } catch(e) {
    console.error("Error 3:", e);
  }
}

run();
