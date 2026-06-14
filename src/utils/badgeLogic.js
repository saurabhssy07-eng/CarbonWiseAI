import { BADGES } from './co2Constants';

export function computeEarnedBadges(stats) {
  if (!stats) return [];
  return BADGES.filter((badge) => {
    try { return badge.condition(stats); }
    catch { return false; }
  }).map((b) => b.id);
}

export function getNewBadges(oldBadges = [], newBadges = []) {
  return newBadges.filter((id) => !oldBadges.includes(id));
}

export function getBadgeById(id) {
  return BADGES.find((b) => b.id === id);
}

export function getBadgeProgress(stats) {
  return BADGES.map((badge) => {
    let progress = 0;
    let target   = 1;
    let earned   = false;

    try {
      earned = badge.condition(stats);
    } catch {
      earned = false;
    }

    // Custom progress for specific badges
    switch (badge.id) {
      case 'first_log':    progress = Math.min(stats?.totalLogs ?? 0, 1);       target = 1;   break;
      case 'week_streak':  progress = Math.min(stats?.currentStreak ?? 0, 7);   target = 7;   break;
      case 'month_streak': progress = Math.min(stats?.currentStreak ?? 0, 30);  target = 30;  break;
      case 'saver_10':     progress = Math.min(stats?.lifetimeCO2Saved ?? 0, 10);  target = 10;  break;
      case 'saver_100':    progress = Math.min(stats?.lifetimeCO2Saved ?? 0, 100); target = 100; break;
      case 'low_carbon':   progress = earned ? 1 : 0; target = 1; break;
      case 'no_meat':      progress = Math.min(stats?.vegDays ?? 0, 1); target = 1; break;
      case 'car_free':     progress = Math.min(stats?.carFreeDays ?? 0, 1); target = 1; break;
      default:             progress = earned ? 1 : 0; target = 1;
    }

    return {
      ...badge,
      earned,
      progress,
      target,
      pct: Math.round((progress / target) * 100),
    };
  });
}

export function updateStatsFromLog(existingStats = {}, logData = {}, previousLogDate = null) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak logic
  let currentStreak = existingStats.currentStreak ?? 0;
  if (previousLogDate === yesterday) {
    currentStreak += 1;
  } else if (previousLogDate !== today) {
    currentStreak = 1;
  }

  const longestStreak = Math.max(existingStats.longestStreak ?? 0, currentStreak);
  const totalLogs     = (existingStats.totalLogs ?? 0) + 1;

  // CO2 saved vs global average (4.7 kg/day)
  const savedToday    = Math.max(0, 4.7 - (logData.totalCO2 ?? 0));
  const lifetimeCO2Saved = (existingStats.lifetimeCO2Saved ?? 0) + savedToday;

  // Track best day
  const bestDay = Math.min(existingStats.bestDay ?? 999, logData.totalCO2 ?? 999);

  // Veg days
  const hasMeat  = (logData.food ?? []).some((f) => ['beef','pork','chicken','fish','fast_food'].includes(f.type));
  const vegDays  = (existingStats.vegDays ?? 0) + (hasMeat ? 0 : 1);

  // Car-free days
  const usedCar   = (logData.transport ?? []).some((t) => ['car_petrol','car_diesel','motorbike'].includes(t.type));
  const carFreeDays = (existingStats.carFreeDays ?? 0) + (usedCar ? 0 : 1);

  return {
    totalLogs,
    currentStreak,
    longestStreak,
    lifetimeCO2Saved: Math.round(lifetimeCO2Saved * 100) / 100,
    bestDay,
    vegDays,
    carFreeDays,
    lastLogDate: today,
  };
}
