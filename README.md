# CarbonWise AI 🌿

**PromptWars Virtual Hackathon Project**

> AI-powered personal carbon footprint tracker with Gemini-driven insights, gamification, and a real-time coaching chatbot.

---

## 🚀 Features

- **Google OAuth Authentication** via Firebase
- **Daily Activity Logger** — Transport, Food, Energy & Shopping with real CO₂ emission factors (IPCC/EPA data)
- **Animated Carbon Score Gauge** — SVG arc gauge with 0–100 score + benchmark lines
- **AI Daily Insights** — Gemini 1.5 Flash analyzes your day and returns personalized tips
- **AI Carbon Coach** — Full-page + floating widget multi-turn chat with Gemini
- **Weekly AI Report** — Grade (A–D), score, and 3-paragraph performance summary
- **Streak System** — Daily logging streaks with 8 achievement badges
- **Weekly Challenges** — 4 eco-challenges with leaderboard
- **Anonymous Leaderboard** — Opt-in nickname system
- **14-Day Trend Charts** — Recharts area + stacked bar charts
- **Mobile-first Responsive** — Desktop sidebar + mobile drawer navigation
- **DEMO MODE** — Works without API keys using realistic mock AI responses

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Firebase project (free tier works)
- Gemini API key (optional — app runs in demo mode without it)

### 1. Clone & Install

```bash
git clone <repo-url>
cd carbonwise-ai
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Google** sign-in
4. Create a **Firestore database** (start in test mode)
5. Add a **Web App** and copy the config

### 3. Get Gemini API Key (Optional)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key

### 4. Set Environment Variables

Copy `.env.local` and fill in your keys:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
```

> **Note**: If `VITE_GEMINI_API_KEY` is not set, the app runs in **DEMO MODE** with realistic mock AI responses.

### 5. Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /leaderboard/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /challenges/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Architecture

```
React (Vite) ─── Firebase Auth ─── Google OAuth
                ├── Firestore ───── User data, logs, leaderboard
                └── Gemini AI ───── 4 integration points:
                                    1. Baseline analysis (onboarding)
                                    2. Daily insight + tip
                                    3. Multi-turn coach chat
                                    4. Weekly report generation
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/services/gemini.js` | All 4 Gemini AI calls + DEMO mode |
| `src/services/firestore.js` | Firestore CRUD operations |
| `src/utils/carbonCalculator.js` | CO₂ calculation engine |
| `src/utils/co2Constants.js` | IPCC/EPA emission factors |
| `src/components/coach/FloatingCoach.jsx` | Floating chat widget |
| `src/pages/Dashboard.jsx` | Main dashboard |

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Charts | Recharts |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Google Gemini 1.5 Flash |
| Animations | Framer Motion |
| Icons | Lucide React |

---

*Built for PromptWars Virtual Hackathon 2025*
