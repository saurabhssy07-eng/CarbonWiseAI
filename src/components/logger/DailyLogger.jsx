import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { EMISSION_FACTORS } from '../../utils/co2Constants';
import { calculateTotalCO2 } from '../../utils/carbonCalculator';

const TABS = ['Transport', 'Food', 'Energy', 'Shopping'];
const CATEGORY_KEYS = ['transport', 'food', 'energy', 'shopping'];

function EntryRow({ entry, category, onChange, onRemove }) {
  const factors = EMISSION_FACTORS[category];
  const selectedFactor = factors[entry.type];
  const unitLabel = selectedFactor?.unit ?? 'unit';

  const valueKey = category === 'transport' ? 'distance'
                 : category === 'energy'    ? 'amount'
                 : 'quantity';

  const maxValue = category === 'transport' ? 1000
                 : category === 'energy'    ? 500
                 : category === 'shopping'  ? 50
                 : 50; // food

  const val = entry[valueKey] ?? '';

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-carbon-800/60 border border-white/5">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="relative">
          <select value={entry.type} onChange={(e) => onChange({ ...entry, type: e.target.value })}
                  className="select-field py-2 text-xs pr-8 w-full">
            {Object.entries(factors).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max={maxValue}
            step="0.1"
            value={val === 0 ? '' : val}
            onChange={(e) => {
              let newVal = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
              if (newVal > maxValue) newVal = maxValue;
              onChange({ ...entry, [valueKey]: newVal });
            }}
            placeholder="0"
            className="input-field py-2 text-xs flex-1"
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">{unitLabel}</span>
        </div>
      </div>

      {/* CO2 preview */}
      <div className="text-right min-w-[52px]">
        <p className="text-xs font-semibold text-green-400">
          {(() => {
            const f   = selectedFactor?.factor ?? 0;
            const previewVal = parseFloat(val) || 0;
            return `${(f * previewVal).toFixed(2)}`;
          })()}
        </p>
        <p className="text-[10px] text-gray-600">kg CO₂</p>
      </div>

      <button onClick={onRemove} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function DailyLogger({ onSubmit, initialData = {} }) {
  const [activeTab, setActiveTab] = useState(0);
  const [entries, setEntries] = useState({
    transport: initialData.transport ?? [],
    food:      initialData.food      ?? [],
    energy:    initialData.energy    ?? [],
    shopping:  initialData.shopping  ?? [],
  });

  const category = CATEGORY_KEYS[activeTab];
  const factors  = EMISSION_FACTORS[category];
  const defaultType = Object.keys(factors)[0];

  function addEntry() {
    const newEntry = { type: defaultType, quantity: 0, distance: 0, amount: 0 };
    setEntries((e) => ({ ...e, [category]: [...e[category], newEntry] }));
  }

  function updateEntry(idx, val) {
    setEntries((e) => {
      const list = [...e[category]];
      list[idx] = val;
      return { ...e, [category]: list };
    });
  }

  function removeEntry(idx) {
    setEntries((e) => {
      const list = e[category].filter((_, i) => i !== idx);
      return { ...e, [category]: list };
    });
  }

  const totals = calculateTotalCO2(entries);

  const tabColors = ['text-green-400', 'text-teal-400', 'text-amber-400', 'text-purple-400'];
  const tabIcons  = ['🚗', '🍽️', '⚡', '🛒'];

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-carbon-800/60">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === i
                ? `bg-carbon-700 ${tabColors[i]}`
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-base mb-0.5">{tabIcons[i]}</span>
            <span className="hidden sm:block">{tab}</span>
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2 min-h-[160px]">
        {entries[category].length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600 text-sm">
            <span className="text-3xl mb-2">{tabIcons[activeTab]}</span>
            <p>No {TABS[activeTab].toLowerCase()} entries yet</p>
          </div>
        )}
        {entries[category].map((entry, i) => (
          <EntryRow key={i} entry={entry} category={category}
                    onChange={(val) => updateEntry(i, val)}
                    onRemove={() => removeEntry(i)} />
        ))}
        <button onClick={addEntry}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm hover:border-green-500/40 hover:text-green-400 transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add {TABS[activeTab]} Entry
        </button>
      </div>

      {/* Totals */}
      <div className="glass-card p-4">
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Today's Summary</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Transport', val: totals.transport, color: 'text-green-400'  },
            { label: 'Food',      val: totals.food,      color: 'text-teal-400'   },
            { label: 'Energy',    val: totals.energy,    color: 'text-amber-400'  },
            { label: 'Shopping',  val: totals.shopping,  color: 'text-purple-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center">
              <p className={`text-sm font-bold ${color}`}>{val.toFixed(2)}</p>
              <p className="text-[10px] text-gray-600">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-sm text-gray-400">Total CO₂ today</span>
          <span className="text-lg font-bold text-white">{totals.total.toFixed(2)} kg</span>
        </div>
      </div>

      {/* Submit */}
      <button onClick={() => onSubmit(entries, totals)}
              className="btn-primary w-full py-3.5 text-base">
        💾 Save Today's Log
      </button>
    </div>
  );
}
