import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  where,
} from 'firebase/firestore';
import { db, FIREBASE_READY } from './firebase';
import { getTodayStr, getWeekId, getWeekStartEnd } from '../utils/dateUtils';

// ── Guard helper ──────────────────────────────────────────────────────────────
function noFirebase(fallback) {
  if (!FIREBASE_READY || !db) return fallback !== undefined ? fallback : null;
  return '__ok__';
}

// ── User Profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  if (noFirebase() !== '__ok__') return null;
  const ref  = doc(db, 'users', uid, 'profile', 'data');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfile(uid, userData) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'users', uid, 'profile', 'data');
  await setDoc(ref, { ...userData, onboardingComplete: false, createdAt: serverTimestamp() }, { merge: true });
}

export async function updateUserProfile(uid, updates) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'users', uid, 'profile', 'data');
  await updateDoc(ref, updates);
}

export async function completeOnboarding(uid, baselineProfile) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'users', uid, 'profile', 'data');
  await updateDoc(ref, { onboardingComplete: true, baselineProfile, updatedAt: serverTimestamp() });
}

// ── User Stats ────────────────────────────────────────────────────────────────

export const DEFAULT_STATS = {
  totalLogs: 0, currentStreak: 0, longestStreak: 0, lifetimeCO2Saved: 0,
  bestDay: 999, vegDays: 0, carFreeDays: 0, badgesEarned: [], lastLogDate: null,
};

export async function getUserStats(uid) {
  if (noFirebase() !== '__ok__') return { ...DEFAULT_STATS };
  const ref  = doc(db, 'users', uid, 'stats', 'data');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { ...DEFAULT_STATS };
}

export async function updateUserStats(uid, stats) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'users', uid, 'stats', 'data');
  await setDoc(ref, { ...stats, updatedAt: serverTimestamp() }, { merge: true });
}

// ── Daily Logs ────────────────────────────────────────────────────────────────

export async function getDailyLog(uid, dateStr = getTodayStr()) {
  if (noFirebase() !== '__ok__') return null;
  const ref  = doc(db, 'users', uid, 'logs', dateStr);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveDailyLog(uid, logData, dateStr = getTodayStr()) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'users', uid, 'logs', dateStr);
  await setDoc(ref, { ...logData, date: dateStr, savedAt: serverTimestamp() }, { merge: true });
}

export async function getRecentLogs(uid, days = 30) {
  if (noFirebase() !== '__ok__') return [];
  const logsRef = collection(db, 'users', uid, 'logs');
  const q = query(logsRef, orderBy('date', 'desc'), limit(days));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToLogs(uid, callback, days = 30) {
  if (noFirebase() !== '__ok__') { callback([]); return () => {}; }
  const logsRef = collection(db, 'users', uid, 'logs');
  const q = query(logsRef, orderBy('date', 'desc'), limit(days));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ── Leaderboard (Firestore-backed, real-time) ─────────────────────────────────

export function subscribeToLeaderboard(weekId, callback) {
  if (noFirebase() !== '__ok__') { callback([]); return () => {}; }
  const ref = collection(db, 'leaderboard', weekId, 'entries');
  const q   = query(ref, orderBy('weeklyAvg', 'asc'), limit(20));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d, i) => ({
      id:   d.id,
      rank: i + 1,
      ...d.data(),
    }));
    callback(entries);
  });
}

export async function upsertLeaderboardEntry(uid, weekId, entry) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'leaderboard', weekId, 'entries', uid);
  await setDoc(ref, { ...entry, updatedAt: serverTimestamp() }, { merge: true });
}

// ── Challenges (Firestore-backed) ─────────────────────────────────────────────

// Default challenge definitions used for seeding
export const CHALLENGE_DEFINITIONS = [
  {
    id:                  'car-free-week',
    title:               '🚲 Car-Free Week',
    description:         'Use only zero-emission transport for 7 consecutive days.',
    targetCO2Reduction:  14.7,
    category:            'Transport',
    difficulty:          'Medium',
    checkFn:             (log) => !(log.transport ?? []).some((t) => ['car_petrol','car_diesel','motorbike'].includes(t.type)),
  },
  {
    id:                  'vegan-5-days',
    title:               '🌱 Plant-Powered 5',
    description:         'Eat fully plant-based for 5 days this week.',
    targetCO2Reduction:  8.5,
    category:            'Food',
    difficulty:          'Easy',
    checkFn:             (log) => !(log.food ?? []).some((f) => ['beef','pork','chicken','fish','fast_food'].includes(f.type)),
  },
  {
    id:                  'energy-saver',
    title:               '⚡ Energy Minimalist',
    description:         'Keep your daily energy usage under 5 kWh for a week.',
    targetCO2Reduction:  7.0,
    category:            'Energy',
    difficulty:          'Hard',
    checkFn:             (log) => (log.energy ?? []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) < 5,
  },
  {
    id:                  'zero-shopping',
    title:               '🛒 No-Buy Week',
    description:         'Avoid all non-essential shopping for 7 days.',
    targetCO2Reduction:  20.0,
    category:            'Shopping',
    difficulty:          'Hard',
    checkFn:             (log) => (log.shopping ?? []).length === 0,
  },
];

/** Seed challenge documents (call once on first launch or if collection is empty) */
export async function seedChallengesIfNeeded() {
  if (noFirebase() !== '__ok__') return;
  const weekId = getWeekId();
  const ref    = collection(db, 'challenges');
  const snap   = await getDocs(query(ref, limit(1)));
  if (!snap.empty) return; // already seeded

  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  await Promise.all(
    CHALLENGE_DEFINITIONS.map((c) =>
      setDoc(doc(db, 'challenges', c.id), {
        id:                 c.id,
        title:              c.title,
        description:        c.description,
        targetCO2Reduction: c.targetCO2Reduction,
        category:           c.category,
        difficulty:         c.difficulty,
        weekId,
        endDate:            endOfWeek.toISOString(),
        participants:       [],
        createdAt:          serverTimestamp(),
      })
    )
  );
}

export function subscribeToChallenges(callback) {
  if (noFirebase() !== '__ok__') { callback(CHALLENGE_DEFINITIONS.map(({ checkFn, ...rest }) => rest)); return () => {}; }
  const ref = collection(db, 'challenges');
  return onSnapshot(ref, (snap) => {
    const challenges = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(challenges);
  });
}

/** Join a challenge — adds uid to participants array, and retroactively evaluates all logs for the current week */
export async function joinChallenge(uid, challengeId) {
  if (noFirebase() !== '__ok__') return;
  const ref = doc(db, 'challenges', challengeId);
  await setDoc(ref, { participants: arrayUnion(uid) }, { merge: true });

  // Retroactively check all logs from the start of this week up to today
  const { start } = getWeekStartEnd();
  const todayStr = getTodayStr();
  
  // We can fetch recent logs to get the days already logged
  const logsRef = collection(db, 'users', uid, 'logs');
  const q = query(logsRef, where('date', '>=', start), where('date', '<=', todayStr));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const def = CHALLENGE_DEFINITIONS.find((d) => d.id === challengeId);
    if (!def) return;

    await Promise.all(
      snap.docs.map((docSnap) => {
        const logData = docSnap.data();
        const dateStr = logData.date;
        const passed = def.checkFn ? def.checkFn(logData) : false;
        
        const progressRef = doc(db, 'users', uid, 'challengeProgress', `${challengeId}_${dateStr}`);
        return setDoc(progressRef, {
          challengeId,
          date: dateStr,
          passed,
          savedAt: serverTimestamp(),
        }, { merge: true });
      })
    );
  }
}

/** Store a challenge progress record for this user+day */
export async function updateChallengeProgress(uid, logData) {
  if (noFirebase() !== '__ok__') return;
  const today = getTodayStr();

  // Find challenges the user has joined
  const snap = await getDocs(collection(db, 'challenges'));
  const challenges = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const joined = challenges.filter((c) => (c.participants ?? []).includes(uid));

  await Promise.all(
    joined.map((c) => {
      const def = CHALLENGE_DEFINITIONS.find((d) => d.id === c.id);
      const passed = def?.checkFn ? def.checkFn(logData) : false;
      const progressRef = doc(db, 'users', uid, 'challengeProgress', `${c.id}_${today}`);
      return setDoc(progressRef, {
        challengeId: c.id,
        date: today,
        passed,
        savedAt: serverTimestamp(),
      }, { merge: true });
    })
  );
}

/** Get progress records for a user's joined challenges */
export async function getChallengeProgress(uid) {
  if (noFirebase() !== '__ok__') return {};
  const snap = await getDocs(collection(db, 'users', uid, 'challengeProgress'));
  const result = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    if (!result[data.challengeId]) result[data.challengeId] = [];
    result[data.challengeId].push(data);
  });
  return result;
}

export async function getActiveChallenges() {
  if (noFirebase() !== '__ok__') return [];
  const ref  = collection(db, 'challenges');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
