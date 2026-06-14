/**
 * Carbon Twin Simulator — calculation engine
 *
 * Given a user's current lifestyle and their "twin" adjustments,
 * computes:
 *   - currentDailyKg / twinDailyKg
 *   - annualSavingKg / annualSavingPct
 *   - CO2 score delta
 *   - Equivalence metrics
 */

import { getCarbonScore } from './carbonCalculator';

// ── Emission baselines per category (kg CO₂/day) ─────────────────────────────

export const TRANSPORT_FACTORS = {
  car:    { label: 'Car (petrol)',    kg: 3.0,  icon: '🚗' },
  carpool:{ label: 'Carpool',         kg: 1.5,  icon: '🚙' },
  public: { label: 'Public Transit',  kg: 0.8,  icon: '🚌' },
  bike:   { label: 'Bicycle',         kg: 0.05, icon: '🚲' },
  walk:   { label: 'Walking',         kg: 0.0,  icon: '🚶' },
  electric:{ label: 'Electric Car',  kg: 0.7,  icon: '⚡' },
};

export const DIET_FACTORS = {
  'meat-heavy': { label: 'Meat-Heavy',   kg: 2.5,  icon: '🥩' },
  omnivore:     { label: 'Omnivore',     kg: 1.8,  icon: '🍽️' },
  flexitarian:  { label: 'Flexitarian',  kg: 1.2,  icon: '🥗' },
  vegetarian:   { label: 'Vegetarian',   kg: 1.0,  icon: '🌿' },
  vegan:        { label: 'Vegan',        kg: 0.5,  icon: '🌱' },
};

export const ENERGY_FACTORS = {
  fossil:    { label: 'Fossil Fuels',   kg: 1.5,  icon: '🔥' },
  mixed:     { label: 'Mixed Grid',     kg: 0.8,  icon: '⚡' },
  solar:     { label: 'Solar/Wind',     kg: 0.15, icon: '☀️' },
  renewable: { label: 'Green Tariff',   kg: 0.1,  icon: '🌬️' },
};

export const SHOPPING_FACTORS = {
  daily:    { label: 'Daily shopper',    kg: 2.0,  icon: '🛍️' },
  frequent: { label: 'Few times/week',   kg: 1.2,  icon: '🛒' },
  weekly:   { label: 'Weekly',           kg: 0.6,  icon: '📦' },
  minimal:  { label: 'Rarely',           kg: 0.2,  icon: '♻️' },
};

// ── Equivalence constants ─────────────────────────────────────────────────────

const KG_PER_TREE_YEAR     = 21;   // kg CO₂ a tree absorbs per year
const KG_PER_FLIGHT_SHORT  = 255;  // kg CO₂ London–Paris economy
const KG_PER_FLIGHT_LONG   = 900;  // kg CO₂ London–NY return economy
const KG_PER_CAR_KM        = 0.21; // kg CO₂ per km driven (average petrol)
const KG_PER_BURGER        = 2.5;  // kg CO₂ per beef burger

// ── Main calculator ───────────────────────────────────────────────────────────

export function computeTwin(current, twin) {
  const currentDaily =
    (TRANSPORT_FACTORS[current.transport]?.kg ?? 0) +
    (DIET_FACTORS[current.diet]?.kg         ?? 0) +
    (ENERGY_FACTORS[current.energy]?.kg     ?? 0) +
    (SHOPPING_FACTORS[current.shopping]?.kg ?? 0);

  const twinDaily =
    (TRANSPORT_FACTORS[twin.transport]?.kg ?? 0) +
    (DIET_FACTORS[twin.diet]?.kg           ?? 0) +
    (ENERGY_FACTORS[twin.energy]?.kg       ?? 0) +
    (SHOPPING_FACTORS[twin.shopping]?.kg   ?? 0);

  const savingPerDay    = Math.max(0, currentDaily - twinDaily);
  const annualCurrent   = currentDaily * 365;
  const annualTwin      = twinDaily    * 365;
  const annualSaving    = savingPerDay * 365;
  const savingPct       = currentDaily > 0 ? (savingPerDay / currentDaily) * 100 : 0;

  const currentScore    = getCarbonScore(currentDaily);
  const twinScore       = getCarbonScore(twinDaily);
  const scoreDelta      = twinScore - currentScore;

  // Equivalence metrics (annual saving)
  const treesNeeded     = Math.round(annualSaving / KG_PER_TREE_YEAR);
  const shortFlights    = (annualSaving / KG_PER_FLIGHT_SHORT).toFixed(1);
  const longFlights     = (annualSaving / KG_PER_FLIGHT_LONG).toFixed(1);
  const carKmAvoided    = Math.round(annualSaving / KG_PER_CAR_KM);
  const burgersAvoided  = Math.round(annualSaving / KG_PER_BURGER);

  // Category breakdown
  const categories = {
    transport: {
      current: TRANSPORT_FACTORS[current.transport]?.kg ?? 0,
      twin:    TRANSPORT_FACTORS[twin.transport]?.kg    ?? 0,
    },
    diet: {
      current: DIET_FACTORS[current.diet]?.kg     ?? 0,
      twin:    DIET_FACTORS[twin.diet]?.kg         ?? 0,
    },
    energy: {
      current: ENERGY_FACTORS[current.energy]?.kg  ?? 0,
      twin:    ENERGY_FACTORS[twin.energy]?.kg      ?? 0,
    },
    shopping: {
      current: SHOPPING_FACTORS[current.shopping]?.kg ?? 0,
      twin:    SHOPPING_FACTORS[twin.shopping]?.kg    ?? 0,
    },
  };

  return {
    currentDaily:  parseFloat(currentDaily.toFixed(2)),
    twinDaily:     parseFloat(twinDaily.toFixed(2)),
    savingPerDay:  parseFloat(savingPerDay.toFixed(2)),
    annualCurrent: Math.round(annualCurrent),
    annualTwin:    Math.round(annualTwin),
    annualSaving:  Math.round(annualSaving),
    savingPct:     parseFloat(savingPct.toFixed(1)),
    currentScore,
    twinScore,
    scoreDelta,
    equivalents: { treesNeeded, shortFlights, longFlights, carKmAvoided, burgersAvoided },
    categories,
  };
}

/** Initial values derived from user's onboarding profile */
export function defaultFromProfile(profile) {
  const bp = profile?.baselineProfile ?? {};
  return {
    transport: bp.transportMode === 'car'    ? 'car'
             : bp.transportMode === 'public' ? 'public'
             : bp.transportMode === 'bike'   ? 'bike'
             : bp.transportMode === 'walk'   ? 'walk'
             : 'car',
    diet:      bp.dietType ?? 'omnivore',
    energy:    bp.energySource === 'fossil'    ? 'fossil'
             : bp.energySource === 'mixed'     ? 'mixed'
             : bp.energySource === 'renewable' ? 'renewable'
             : 'mixed',
    shopping:  'weekly',
  };
}
