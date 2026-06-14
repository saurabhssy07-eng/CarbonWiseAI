import { useEffect } from 'react';
import { subscribeToLogs } from '../services/firestore';
import { FIREBASE_READY } from '../services/firebase';
import useAppStore from '../store/useAppStore';
import { getLast7Days } from '../utils/dateUtils';

// Realistic demo logs so charts/history look great without real data
function buildDemoLogs() {
  const days = getLast7Days();
  const baseValues = [3.8, 2.1, 5.4, 1.9, 4.7, 3.2, 2.8];
  return days.map((date, i) => ({
    id:       date,
    date,
    totalCO2: baseValues[i],
    categories: {
      transport: { co2: parseFloat((baseValues[i] * 0.45).toFixed(2)) },
      food:      { co2: parseFloat((baseValues[i] * 0.35).toFixed(2)) },
      energy:    { co2: parseFloat((baseValues[i] * 0.15).toFixed(2)) },
      shopping:  { co2: parseFloat((baseValues[i] * 0.05).toFixed(2)) },
    },
    geminiInsight:  "Great job keeping transport emissions low today! Your food choices were the biggest contributor.",
    geminiTip:      "Try swapping one meal this week to fully plant-based — it can save up to 1.5 kg CO₂.",
    encouragement:  "Every small action adds up. You're building habits that matter! 🌍",
    transport: [{ type: 'car_petrol', distance: 5 }],
    food:      [{ type: 'vegetarian_meal', quantity: 2 }],
    energy:    [{ type: 'electricity', amount: 3 }],
    shopping:  [],
  }));
}

export function useFirestore() {
  const { user, setLogs } = useAppStore();

  useEffect(() => {
    if (!user?.uid) return;

    if (!FIREBASE_READY) {
      // Inject realistic demo data so charts & history are populated
      setLogs(buildDemoLogs());
      return;
    }

    const unsub = subscribeToLogs(user.uid, (logs) => {
      setLogs(logs);
    }, 30);
    return unsub;
  }, [user?.uid]);
}
