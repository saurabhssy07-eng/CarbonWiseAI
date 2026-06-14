import { GoogleGenerativeAI } from '@google/generative-ai';
import { EMISSION_FACTORS } from '../utils/co2Constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Mock responses when API key is not configured (demo mode)
const DEMO_MODE = !API_KEY || API_KEY === 'your_gemini_api_key_here';

function getClient() {
  if (DEMO_MODE) return null;
  return new GoogleGenerativeAI(API_KEY);
}

function getModel(client) {
  return client.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

async function safeGenerate(promptText, fallback) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return fallback;
  }
  try {
    const client = getClient();
    const model  = getModel(client);
    const result = await model.generateContent(promptText);
    return result.response.text();
  } catch (err) {
    console.error('Gemini API error:', err);
    return fallback;
  }
}

// ── 1. Onboarding Baseline Analysis ──────────────────────────────────────────

export async function analyzeBaseline(profile) {
  const prompt = `
You are a carbon footprint expert. Analyze this user's lifestyle profile:
- Transport: ${profile.transportMode} (primary mode)
- Diet: ${profile.dietType}
- Home size: ${profile.homeSize}
- Energy source: ${profile.energySource}

Return ONLY valid JSON (no markdown, no explanation):
{
  "baseline_kg_day": <number>,
  "annual_kg": <number>,
  "comparison": "<one sentence comparing to 4.7kg global average>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

  const fallback = JSON.stringify({
    baseline_kg_day: 4.2,
    annual_kg: 1533,
    comparison: "Your footprint is close to the global average of 4.7 kg/day.",
    tips: [
      "Try cycling or public transport for short trips to cut transport emissions by up to 70%.",
      "Reducing meat consumption to 3 days per week can save over 400 kg CO₂ annually.",
      "Switch to LED bulbs and unplug devices when not in use to trim your energy footprint."
    ]
  });

  const raw = await safeGenerate(prompt, fallback);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(fallback);
  }
}

// ── 2. Daily Log Scoring & Insight ───────────────────────────────────────────

function enrichLog(entries, category) {
  if (!entries || !entries.length) return [];
  return entries.map(e => {
     const factor = EMISSION_FACTORS[category][e.type]?.factor ?? 0;
     const val = e.distance || e.amount || e.quantity || (category === 'food' ? 1 : 0);
     return { ...e, co2_kg: Number((factor * val).toFixed(2)) };
  });
}

export async function generateDailyInsight(logData, totalCO2, userProfile) {
  const prompt = `
You are CarbonWise, an encouraging carbon coach. Today's log:
- Transport: ${JSON.stringify(enrichLog(logData.transport, 'transport'))}
- Food: ${JSON.stringify(enrichLog(logData.food, 'food'))}
- Energy: ${JSON.stringify(enrichLog(logData.energy, 'energy'))}
- Shopping: ${JSON.stringify(enrichLog(logData.shopping, 'shopping'))}
- Total CO₂: ${totalCO2} kg (global average is 4.7 kg/day)

Return ONLY valid JSON:
{
  "insight": "<2 sentences: acknowledge what they did well or what was high, be specific>",
  "tip": "<1 specific actionable tip for tomorrow based on their biggest emission category>",
  "encouragement": "<short, energetic, positive 1-liner>"
}`;

  const category = ['transport','food','energy','shopping'].reduce((a, b) =>
    (logData[a]?.length ?? 0) > (logData[b]?.length ?? 0) ? a : b, 'food');

  const fallback = JSON.stringify({
    insight: `Your total footprint today was ${totalCO2} kg CO₂. ${totalCO2 < 4.7 ? "That's below the global average — great work!" : "There's room to reduce, especially in your biggest categories."}`,
    tip: "Try swapping one meal this week to a plant-based option — it's one of the fastest ways to cut your footprint.",
    encouragement: "Every small action adds up. You're building habits that matter! 🌍"
  });

  const raw = await safeGenerate(prompt, fallback);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(fallback);
  }
}

// ── 3. AI Carbon Coach — Multi-turn Chat ─────────────────────────────────────

let chatSession = null;
let chatHistory = [];

export async function startCoachChat(userProfile, recentAvg, todayLog) {
  chatHistory = [];

  let todayContext = "The user has not logged any activities for today yet.";
  if (todayLog) {
    todayContext = `Today's logged activities (Total CO2: ${todayLog.totalCO2?.toFixed(2) ?? 0} kg):
- Transport: ${JSON.stringify(enrichLog(todayLog.transport, 'transport'))}
- Food: ${JSON.stringify(enrichLog(todayLog.food, 'food'))}
- Energy: ${JSON.stringify(enrichLog(todayLog.energy, 'energy'))}
- Shopping: ${JSON.stringify(enrichLog(todayLog.shopping, 'shopping'))}`;
  }

  const systemContext = `You are CarbonWise Coach, a friendly and knowledgeable carbon footprint expert.
User profile: Diet=${userProfile?.baselineProfile?.dietType ?? 'omnivore'}, 
Transport=${userProfile?.baselineProfile?.transportMode ?? 'car'},
Recent 7-day average: ${recentAvg?.toFixed(2) ?? '4.7'} kg CO₂/day.

${todayContext}

Be encouraging, specific, and practical. Keep replies under 120 words. Use emojis sparingly. Answer questions about the user's data accurately based on the context provided.
CRITICAL RULE: DO NOT invent, assume, or hallucinate any details about the user's profile (like claiming they are vegan) unless it is explicitly stated in the User profile line above.`;

  if (!DEMO_MODE) {
    try {
      const client = getClient();
      const model  = getModel(client);
      chatSession = model.startChat({
        history: [],
      });
      // Prime with system context
      await chatSession.sendMessage(systemContext + '\n\nConfirm you are ready with a brief greeting.');
    } catch (err) {
      console.error('Chat init error:', err);
      chatSession = null;
    }
  }

  return "Hey! I'm your CarbonWise Coach 🌿 I've looked at your profile and I'm ready to help you reduce your carbon footprint. What would you like to work on today?";
}

export async function sendCoachMessage(userMessage, todayLog) {
  chatHistory.push({ role: 'user', content: userMessage });

  const fallbackReplies = [
    "Great question! The biggest impact you can make is in your diet — try swapping beef for chicken or legumes and you could save up to 1.5 kg CO₂ per meal. Want meal ideas? 🥗",
    "Transport is often the largest source of personal emissions. If you drive, consider carpooling or public transit for your regular commute — this can cut transport emissions by 60-70%! 🚌",
    "Switching to renewable energy at home is one of the highest-impact changes you can make. Many providers offer green tariffs with no extra cost. Worth checking! ⚡",
    "Buying second-hand clothing instead of new reduces fashion's carbon cost by up to 82%. Have you tried local thrift stores or apps like Vinted? 👕",
    "That's a great step! Consistency is key — small daily habits compound into huge annual savings. You're on the right track! 🌍"
  ];

  const lowerMsg = userMessage.toLowerCase();
  const isBreakdownQuery = lowerMsg.includes('break down') || lowerMsg.includes('breakdown');

  // Helper to generate programmatic breakdown if API fails or in Demo mode
  const getProgrammaticBreakdown = () => {
    if (!todayLog) return "You haven't logged any activities today yet.";
    const trans = todayLog.categories?.transport?.co2 ?? 0;
    const food = todayLog.categories?.food?.co2 ?? 0;
    const energy = todayLog.categories?.energy?.co2 ?? 0;
    const shopping = todayLog.categories?.shopping?.co2 ?? 0;
    const total = todayLog.totalCO2 ?? 0;
    return `Here is the breakdown of your emissions today:\n\nTransport: ${trans.toFixed(2)} kg\nFood: ${food.toFixed(2)} kg\nEnergy: ${energy.toFixed(2)} kg\nShopping: ${shopping.toFixed(2)} kg\n\n**Total: ${total.toFixed(2)} kg**`;
  };

  if (DEMO_MODE || !chatSession) {
    await new Promise((r) => setTimeout(r, 1000));
    
    if (isBreakdownQuery) {
      const reply = getProgrammaticBreakdown();
      chatHistory.push({ role: 'assistant', content: reply });
      return reply;
    }

    const reply = fallbackReplies[chatHistory.length % fallbackReplies.length];
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  }

  try {
    const result = await chatSession.sendMessage(userMessage);
    const reply  = result.response.text();
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.error('Chat error:', err);
    
    // If the API rate limits us, but they asked for a breakdown, give it to them anyway!
    if (isBreakdownQuery) {
      const fallback = getProgrammaticBreakdown();
      chatHistory.push({ role: 'assistant', content: fallback });
      return fallback;
    }

    const fallback = "I'm having trouble connecting right now. Try reducing your biggest emission category today — every kg saved counts! 💚";
    chatHistory.push({ role: 'assistant', content: fallback });
    return fallback;
  }
}

// ── 4. Weekly Report Generation ───────────────────────────────────────────────

export async function generateWeeklyReport(logs, stats, userProfile) {
  const avgCO2 = logs.length
    ? (logs.reduce((sum, l) => sum + (l.totalCO2 ?? 0), 0) / logs.length).toFixed(2)
    : 0;

  const prompt = `
You are CarbonWise. Generate a weekly carbon report for this user.
Stats: streak=${stats?.currentStreak ?? 0} days, saved ${stats?.lifetimeCO2Saved?.toFixed(1) ?? 0}kg lifetime vs global average.
7-day average: ${avgCO2} kg CO₂/day (global average is 4.7 kg/day).
Diet: ${userProfile?.baselineProfile?.dietType ?? 'omnivore'}.
${logs.length} days logged this week.

Return ONLY valid JSON:
{
  "headline": "<punchy headline for their week, max 10 words>",
  "performance": "<paragraph 1: how they performed this week, specific numbers>",
  "highlights": "<paragraph 2: what they did well, specific categories or actions>",
  "goals": "<paragraph 3: 2-3 specific goals for next week>",
  "score": <number 0-100 representing their week>,
  "grade": "<A+/A/B+/B/C+/C/D>"
}`;

  const fallback = JSON.stringify({
    headline: "A Solid Week for the Planet! 🌍",
    performance: `You logged ${logs.length} days this week with an average of ${avgCO2} kg CO₂ per day. ${parseFloat(avgCO2) < 4.7 ? "That's below the global average of 4.7 kg/day — you're doing better than most!" : "There's room to improve toward the Paris target of 3 kg/day."}`,
    highlights: "Your consistency in logging is your biggest win. Tracking your footprint is the first step to reducing it, and you showed up this week.",
    goals: "1. Aim for one car-free day this week. 2. Try one plant-based meal per day. 3. Log every day to keep your streak going!",
    score: 65,
    grade: "B+"
  });

  const raw = await safeGenerate(prompt, fallback);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(fallback);
  }
}

export { DEMO_MODE };
