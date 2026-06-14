import { EMISSION_FACTORS, BENCHMARKS } from './co2Constants';

export function calculateTransportCO2(entries = []) {
  return entries.reduce((total, entry) => {
    const factor = EMISSION_FACTORS.transport[entry.type]?.factor ?? 0;
    return total + factor * (parseFloat(entry.distance) || 0);
  }, 0);
}

export function calculateFoodCO2(entries = []) {
  return entries.reduce((total, entry) => {
    const factor = EMISSION_FACTORS.food[entry.type]?.factor ?? 0;
    return total + factor * (parseFloat(entry.quantity) || 1);
  }, 0);
}

export function calculateEnergyCO2(entries = []) {
  return entries.reduce((total, entry) => {
    const factor = EMISSION_FACTORS.energy[entry.type]?.factor ?? 0;
    return total + factor * (parseFloat(entry.amount) || 0);
  }, 0);
}

export function calculateShoppingCO2(entries = []) {
  return entries.reduce((total, entry) => {
    const factor = EMISSION_FACTORS.shopping[entry.type]?.factor ?? 0;
    return total + factor * (parseFloat(entry.quantity) || 1);
  }, 0);
}

export function calculateTotalCO2(logData = {}) {
  const transport = calculateTransportCO2(logData.transport);
  const food      = calculateFoodCO2(logData.food);
  const energy    = calculateEnergyCO2(logData.energy);
  const shopping  = calculateShoppingCO2(logData.shopping);
  const total     = transport + food + energy + shopping;

  const round = (n) => Math.round(n * 100) / 100;

  return {
    transport: round(transport),
    food:      round(food),
    energy:    round(energy),
    shopping:  round(shopping),
    total:     round(total),
  };
}

// Score 0–100 (higher = greener)
export function getCarbonScore(dailyKg) {
  if (dailyKg <= 0)               return 100;
  if (dailyKg <= BENCHMARKS.EXCELLENT) return Math.round(90 + (BENCHMARKS.EXCELLENT - dailyKg) / BENCHMARKS.EXCELLENT * 10);
  if (dailyKg <= BENCHMARKS.PARIS_TARGET) return Math.round(70 + (BENCHMARKS.PARIS_TARGET - dailyKg) / (BENCHMARKS.PARIS_TARGET - BENCHMARKS.EXCELLENT) * 20);
  if (dailyKg <= BENCHMARKS.GLOBAL_AVERAGE) return Math.round(40 + (BENCHMARKS.GLOBAL_AVERAGE - dailyKg) / (BENCHMARKS.GLOBAL_AVERAGE - BENCHMARKS.PARIS_TARGET) * 30);
  if (dailyKg <= BENCHMARKS.HIGH) return Math.round(15 + (BENCHMARKS.HIGH - dailyKg) / (BENCHMARKS.HIGH - BENCHMARKS.GLOBAL_AVERAGE) * 25);
  return Math.max(0, Math.round(15 - (dailyKg - BENCHMARKS.HIGH) * 1.5));
}

export function getCarbonLabel(dailyKg) {
  if (dailyKg <= BENCHMARKS.EXCELLENT)      return { label: 'Excellent', colorClass: 'text-green-400',  bgClass: 'bg-green-500/20',  hex: '#22c55e' };
  if (dailyKg <= BENCHMARKS.PARIS_TARGET)   return { label: 'Good',      colorClass: 'text-teal-400',   bgClass: 'bg-teal-500/20',   hex: '#14b8a6' };
  if (dailyKg <= BENCHMARKS.GLOBAL_AVERAGE) return { label: 'Average',   colorClass: 'text-yellow-400', bgClass: 'bg-yellow-500/20', hex: '#eab308' };
  if (dailyKg <= BENCHMARKS.HIGH)           return { label: 'High',      colorClass: 'text-orange-400', bgClass: 'bg-orange-500/20', hex: '#f97316' };
  return                                           { label: 'Very High',  colorClass: 'text-red-400',    bgClass: 'bg-red-500/20',    hex: '#ef4444' };
}

export function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#14b8a6';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

export function formatCO2(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(2)} kg`;
}

export function co2SavedVsAverage(dailyKg) {
  return Math.max(0, BENCHMARKS.GLOBAL_AVERAGE - dailyKg);
}

export function getBaselineCO2(profile) {
  if (!profile) return BENCHMARKS.GLOBAL_AVERAGE;

  let base = 0;

  // Transport baseline
  const transportFactors = {
    car:    3.0,
    bike:   0.2,
    public: 0.8,
    walk:   0.0,
  };
  base += transportFactors[profile.transportMode] ?? 1.5;

  // Diet baseline
  const dietFactors = {
    'meat-heavy': 2.5,
    omnivore:     1.8,
    vegetarian:   1.0,
    vegan:        0.5,
  };
  base += dietFactors[profile.dietType] ?? 1.5;

  // Energy baseline
  const energyFactors = {
    fossil:    1.5,
    mixed:     0.8,
    renewable: 0.2,
  };
  base += energyFactors[profile.energySource] ?? 0.8;

  return Math.round(base * 100) / 100;
}
