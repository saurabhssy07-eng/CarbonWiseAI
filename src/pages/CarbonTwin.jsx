import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, TrendingDown, Trees, Car, Plane, Leaf, Info, RotateCcw } from 'lucide-react';
import {
  TRANSPORT_FACTORS, DIET_FACTORS, ENERGY_FACTORS, SHOPPING_FACTORS,
  computeTwin, defaultFromProfile,
} from '../utils/carbonTwinCalculator';
import useAppStore from '../store/useAppStore';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// ── Category selector component ───────────────────────────────────────────────
function CategorySelector({ label, icon: CatIcon, value, onChange, options, colorClass }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <CatIcon className={`w-3.5 h-3.5 ${colorClass}`} />
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {Object.entries(options).map(([key, opt]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm ${
              value === key
                ? 'border-green-500/40 bg-green-500/10 text-white'
                : 'border-white/5 bg-carbon-800/40 text-gray-400 hover:border-white/10 hover:text-gray-300'
            }`}
          >
            <span className="text-lg shrink-0">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium">{opt.label}</span>
            </div>
            <span className={`text-xs font-semibold shrink-0 ${
              value === key ? 'text-green-400' : 'text-gray-600'
            }`}>
              {opt.kg} kg/d
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Animated number component ─────────────────────────────────────────────────
function AnimNumber({ value, suffix = '', prefix = '', className = '' }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
    </motion.span>
  );
}

// ── Comparison bar ────────────────────────────────────────────────────────────
function ComparisonBar({ label, currentKg, twinKg, maxKg }) {
  const currentPct = maxKg > 0 ? (currentKg / maxKg) * 100 : 0;
  const twinPct    = maxKg > 0 ? (twinKg    / maxKg) * 100 : 0;
  const saving     = parseFloat((currentKg - twinKg).toFixed(2));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        {saving > 0 && <span className="text-green-400 font-medium">-{saving} kg/d</span>}
      </div>
      {/* Current bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${currentPct}%` }}
          transition={{ duration: 0.4 }}
          className="h-full rounded-full bg-orange-500/60"
        />
      </div>
      {/* Twin bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${twinPct}%` }}
          transition={{ duration: 0.4 }}
          className="h-full rounded-full bg-green-500"
        />
      </div>
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%"
                          data={[{ value: score, fill: color }]}
                          startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CarbonTwin() {
  const { profile } = useAppStore();

  const defaults = useMemo(() => defaultFromProfile(profile), [profile]);

  const [current, setCurrent] = useState(defaults);
  const [twin,    setTwin]    = useState(defaults);

  const result = useMemo(() => computeTwin(current, twin), [current, twin]);

  function resetTwin() { setTwin(defaults); }

  const maxCategoryKg = Math.max(
    result.categories.transport.current,
    result.categories.diet.current,
    result.categories.energy.current,
    result.categories.shopping.current,
    0.1
  );

  const improvingCategories = Object.entries(result.categories)
    .filter(([, v]) => v.twin < v.current).length;

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            🌿 Carbon Twin Simulator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Adjust your future habits and instantly see your projected annual carbon reduction
          </p>
        </div>
        <button onClick={resetTwin} className="btn-secondary text-sm py-2 px-4">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Twin
        </button>
      </div>

      {/* ── Impact hero banner ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${result.annualSaving}-${result.savingPct}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 md:p-8 text-center relative overflow-hidden"
          style={{ background: result.annualSaving > 0
            ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(20,184,166,0.06))'
            : 'rgba(255,255,255,0.03)' }}
        >
          {/* Decorative blob */}
          {result.annualSaving > 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20"
                   style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
            </div>
          )}

          {result.annualSaving > 0 ? (
            <>
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2">
                Your Twin's Annual Impact
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <AnimNumber
                  value={result.annualSaving}
                  suffix=" kg CO₂"
                  className="text-4xl md:text-5xl font-black text-white"
                />
                <div className="text-left">
                  <p className="text-green-400 font-bold text-lg">
                    saved/year
                  </p>
                  <p className="text-2xl font-black text-green-400">
                    ↓ {result.savingPct}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                From <span className="text-orange-400 font-semibold">{result.annualCurrent} kg/yr</span> down to <span className="text-green-400 font-semibold">{result.annualTwin} kg/yr</span>
              </p>
            </>
          ) : (
            <div className="py-4">
              <p className="text-3xl mb-2">🌿</p>
              <p className="text-white font-semibold">Change your twin's habits on the right to see the impact</p>
              <p className="text-gray-400 text-sm mt-1">Adjust transport, diet, energy or shopping below</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Main split layout ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── LEFT: You Today ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <h2 className="text-base font-bold text-white">You Today</h2>
            <span className="badge-pill bg-orange-500/10 text-orange-400 text-[10px]">{result.currentDaily} kg/day</span>
          </div>

          <CategorySelector
            label="Transport" icon={Car} colorClass="text-blue-400"
            value={current.transport} onChange={(v) => setCurrent((c) => ({ ...c, transport: v }))}
            options={TRANSPORT_FACTORS}
          />
          <CategorySelector
            label="Diet" icon={Leaf} colorClass="text-green-400"
            value={current.diet} onChange={(v) => setCurrent((c) => ({ ...c, diet: v }))}
            options={DIET_FACTORS}
          />
          <CategorySelector
            label="Home Energy" icon={Zap} colorClass="text-yellow-400"
            value={current.energy} onChange={(v) => setCurrent((c) => ({ ...c, energy: v }))}
            options={ENERGY_FACTORS}
          />
          <CategorySelector
            label="Shopping" icon={TrendingDown} colorClass="text-purple-400"
            value={current.shopping} onChange={(v) => setCurrent((c) => ({ ...c, shopping: v }))}
            options={SHOPPING_FACTORS}
          />
        </div>

        {/* ── RIGHT: Your Twin ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-base font-bold text-white">Your Carbon Twin</h2>
            <span className="badge-pill bg-green-500/10 text-green-400 text-[10px]">
              <AnimNumber value={result.twinDaily} suffix=" kg/day" />
            </span>
          </div>

          <CategorySelector
            label="Transport" icon={Car} colorClass="text-blue-400"
            value={twin.transport} onChange={(v) => setTwin((t) => ({ ...t, transport: v }))}
            options={TRANSPORT_FACTORS}
          />
          <CategorySelector
            label="Diet" icon={Leaf} colorClass="text-green-400"
            value={twin.diet} onChange={(v) => setTwin((t) => ({ ...t, diet: v }))}
            options={DIET_FACTORS}
          />
          <CategorySelector
            label="Home Energy" icon={Zap} colorClass="text-yellow-400"
            value={twin.energy} onChange={(v) => setTwin((t) => ({ ...t, energy: v }))}
            options={ENERGY_FACTORS}
          />
          <CategorySelector
            label="Shopping" icon={TrendingDown} colorClass="text-purple-400"
            value={twin.shopping} onChange={(v) => setTwin((t) => ({ ...t, shopping: v }))}
            options={SHOPPING_FACTORS}
          />
        </div>
      </div>

      {/* ── Analysis row ──────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Score comparison */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-5 text-center">Carbon Score</h3>
          <div className="flex items-center justify-around">
            <ScoreRing score={result.currentScore} label="You Today"   color="#f97316" />
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="w-5 h-5 text-gray-600" />
              {result.scoreDelta > 0 && (
                <span className="text-xs text-green-400 font-bold">+{result.scoreDelta}</span>
              )}
            </div>
            <ScoreRing score={result.twinScore}    label="Your Twin"   color="#22c55e" />
          </div>
        </div>

        {/* Category comparison bars */}
        <div className="glass-card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Category Breakdown</h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-orange-500/60 rounded inline-block" /> Today</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-green-500   rounded inline-block" /> Twin</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'transport', label: '🚗 Transport' },
              { key: 'diet',      label: '🍽️ Diet'      },
              { key: 'energy',    label: '⚡ Energy'     },
              { key: 'shopping',  label: '🛒 Shopping'   },
            ].map(({ key, label }) => (
              <ComparisonBar
                key={key} label={label}
                currentKg={result.categories[key].current}
                twinKg={result.categories[key].twin}
                maxKg={maxCategoryKg}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Equivalence cards ────────────────────────────────────────────── */}
      {result.annualSaving > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            What {result.annualSaving} kg of annual savings looks like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🌳', value: result.equivalents.treesNeeded,  label: 'Trees planted',           color: 'text-green-400'  },
              { icon: '✈️', value: result.equivalents.shortFlights, label: 'Short flights offset',    color: 'text-blue-400'   },
              { icon: '🚗', value: result.equivalents.carKmAvoided.toLocaleString(), label: 'Car km not driven', color: 'text-orange-400' },
              { icon: '🍔', value: result.equivalents.burgersAvoided.toLocaleString(), label: 'Beef burgers equiv.', color: 'text-red-400' },
            ].map(({ icon, value, label, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-3xl mb-2">{icon}</p>
                <AnimNumber value={value} className={`text-xl font-black ${color}`} />
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 text-xs text-gray-600">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>Estimates use IPCC AR6 emission factors. Actual savings depend on your specific usage patterns, location, and energy grid mix.</p>
      </div>
    </div>
  );
}
