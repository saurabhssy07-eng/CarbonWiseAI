// CO2 Emission Factors based on IPCC & EPA data
// All factors in kg CO2 equivalent per unit

export const EMISSION_FACTORS = {
  transport: {
    car_petrol:   { label: 'Petrol Car',     icon: '🚗', unit: 'km',    factor: 0.21  },
    car_diesel:   { label: 'Diesel Car',     icon: '🚗', unit: 'km',    factor: 0.17  },
    car_electric: { label: 'Electric Car',   icon: '🔋', unit: 'km',    factor: 0.053 },
    motorbike:    { label: 'Motorbike',      icon: '🏍️', unit: 'km',    factor: 0.114 },
    bus:          { label: 'Bus',            icon: '🚌', unit: 'km',    factor: 0.089 },
    train:        { label: 'Train',          icon: '🚆', unit: 'km',    factor: 0.041 },
    flight_short: { label: 'Short-haul Flight', icon: '✈️', unit: 'km', factor: 0.255 },
    flight_long:  { label: 'Long-haul Flight',  icon: '✈️', unit: 'km', factor: 0.195 },
    bicycle:      { label: 'Bicycle',        icon: '🚲', unit: 'km',    factor: 0     },
    walk:         { label: 'Walking',        icon: '🚶', unit: 'km',    factor: 0     },
  },
  food: {
    beef:             { label: 'Beef',              icon: '🥩', unit: 'serving', factor: 3.3  },
    pork:             { label: 'Pork',              icon: '🐷', unit: 'serving', factor: 1.2  },
    chicken:          { label: 'Chicken',           icon: '🍗', unit: 'serving', factor: 0.69 },
    fish:             { label: 'Fish / Seafood',    icon: '🐟', unit: 'serving', factor: 0.61 },
    dairy:            { label: 'Dairy (milk/cheese)',icon: '🧀', unit: 'serving', factor: 0.50 },
    eggs:             { label: 'Eggs',              icon: '🥚', unit: 'serving', factor: 0.20 },
    vegetarian_meal:  { label: 'Vegetarian Meal',   icon: '🥗', unit: 'meal',    factor: 1.0  },
    vegan_meal:       { label: 'Vegan Meal',         icon: '🌱', unit: 'meal',    factor: 0.5  },
    fast_food:        { label: 'Fast Food',          icon: '🍔', unit: 'meal',    factor: 2.5  },
    restaurant:       { label: 'Restaurant Meal',   icon: '🍽️', unit: 'meal',    factor: 2.0  },
  },
  energy: {
    electricity:   { label: 'Electricity',    icon: '⚡', unit: 'kWh',   factor: 0.233 },
    natural_gas:   { label: 'Natural Gas',    icon: '🔥', unit: 'kWh',   factor: 0.203 },
    heating_oil:   { label: 'Heating Oil',    icon: '🛢️', unit: 'litre', factor: 2.54  },
    lpg:           { label: 'LPG',            icon: '💨', unit: 'kWh',   factor: 0.214 },
  },
  shopping: {
    clothing:           { label: 'Clothing Item',       icon: '👕', unit: 'item',  factor: 10  },
    shoes:              { label: 'Shoes',                icon: '👟', unit: 'pair',  factor: 14  },
    electronics_small:  { label: 'Small Electronics',   icon: '📱', unit: 'item',  factor: 70  },
    electronics_large:  { label: 'Large Electronics',   icon: '💻', unit: 'item',  factor: 300 },
    online_delivery:    { label: 'Online Delivery',      icon: '📦', unit: 'order', factor: 0.5 },
    grocery_shop:       { label: 'Grocery Shopping',    icon: '🛒', unit: 'trip',  factor: 0.3 },
  },
};

// Global benchmarks (kg CO2 per day)
export const BENCHMARKS = {
  GLOBAL_AVERAGE:  4.7,
  PARIS_TARGET:    3.0,
  EXCELLENT:       2.0,
  LOW:             3.0,
  MEDIUM:          5.5,
  HIGH:            8.0,
};

// Annual equivalents (kg CO2 per year)
export const ANNUAL_BENCHMARKS = {
  GLOBAL_AVERAGE:  1700,
  PARIS_TARGET:    1100,
  US_AVERAGE:      16000,
  EU_AVERAGE:      8000,
};

export const CATEGORY_COLORS = {
  transport: '#22c55e',
  food:      '#14b8a6',
  energy:    '#f59e0b',
  shopping:  '#8b5cf6',
};

export const BADGES = [
  { id: 'first_log',     label: 'First Step',      icon: '🌱', desc: 'Log your first day',              condition: (stats) => stats.totalLogs >= 1      },
  { id: 'week_streak',   label: 'Week Warrior',    icon: '🔥', desc: '7-day logging streak',            condition: (stats) => stats.currentStreak >= 7   },
  { id: 'month_streak',  label: 'Month Master',    icon: '⚡', desc: '30-day logging streak',           condition: (stats) => stats.currentStreak >= 30  },
  { id: 'low_carbon',    label: 'Green Day',       icon: '🌿', desc: 'Log a day under 2kg CO₂',        condition: (stats) => stats.bestDay <= 2.0       },
  { id: 'no_meat',       label: 'Plant Power',     icon: '🥗', desc: 'Log a full vegetarian day',      condition: (stats) => stats.vegDays >= 1         },
  { id: 'car_free',      label: 'Car-Free',        icon: '🚲', desc: 'Use only zero-emission transport', condition: (stats) => stats.carFreeDays >= 1   },
  { id: 'saver_10',      label: 'CO₂ Saver',       icon: '💚', desc: 'Save 10kg vs your baseline',     condition: (stats) => stats.lifetimeCO2Saved >= 10 },
  { id: 'saver_100',     label: 'Climate Hero',    icon: '🌍', desc: 'Save 100kg vs your baseline',    condition: (stats) => stats.lifetimeCO2Saved >= 100 },
];
