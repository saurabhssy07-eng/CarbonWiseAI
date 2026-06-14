import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { TrendChart, WeeklyBarChart } from '../components/dashboard/TrendChart';
import { formatDate } from '../utils/dateUtils';
import { getCarbonLabel, getCarbonScore } from '../utils/carbonCalculator';
import { BENCHMARKS, CATEGORY_COLORS } from '../utils/co2Constants';

export default function History() {
  const { logs } = useAppStore();
  const [view, setView] = useState('trend'); // 'trend' | 'weekly' | 'table'

  const avg = logs.length
    ? (logs.reduce((s, l) => s + (l.totalCO2 ?? 0), 0) / logs.length).toFixed(2)
    : 0;
  const best  = logs.length ? Math.min(...logs.map((l) => l.totalCO2 ?? 999)).toFixed(2) : 0;
  const total = logs.length ? logs.reduce((s, l) => s + (l.totalCO2 ?? 0), 0).toFixed(1) : 0;

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">History & Trends</h1>
        <p className="text-gray-400 text-sm mt-1">{logs.length} days tracked</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Daily Average', value: `${avg} kg`,  color: 'text-green-400' },
          { label: 'Best Day',      value: `${best} kg`, color: 'text-teal-400'  },
          { label: 'Total Logged',  value: `${total} kg`,color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart tabs */}
      <div className="glass-card p-5">
        <div className="flex gap-2 mb-5">
          {['trend', 'weekly', 'table'].map((v) => (
            <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
              {v === 'trend' ? '📈 Trend' : v === 'weekly' ? '📊 Weekly' : '📋 Table'}
            </button>
          ))}
        </div>

        {view === 'trend'  && <TrendChart logs={logs} />}
        {view === 'weekly' && <WeeklyBarChart logs={logs} />}
        {view === 'table'  && <LogTable logs={logs} />}
      </div>

      {/* Benchmarks legend */}
      <div className="glass-card p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Reference Lines</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { color: '#22c55e', label: 'Paris Target',    val: `${BENCHMARKS.PARIS_TARGET} kg/day`   },
            { color: '#ef4444', label: 'Global Average',  val: `${BENCHMARKS.GLOBAL_AVERAGE} kg/day` },
            { color: '#14b8a6', label: 'Excellent',       val: `< ${BENCHMARKS.EXCELLENT} kg/day`    },
            { color: '#f97316', label: 'High',            val: `> ${BENCHMARKS.HIGH} kg/day`         },
          ].map(({ color, label, val }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-400">{label}: <span className="text-gray-300 font-medium">{val}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogTable({ logs }) {
  if (!logs.length) return (
    <div className="text-center py-8 text-gray-500 text-sm">No logs yet. Start tracking today!</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-white/5">
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2 pr-4">Total</th>
            <th className="pb-2 pr-4">Transport</th>
            <th className="pb-2 pr-4">Food</th>
            <th className="pb-2 pr-4">Energy</th>
            <th className="pb-2">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.map((log) => {
            const { colorClass, label } = getCarbonLabel(log.totalCO2 ?? 0);
            return (
              <tr key={log.id} className="hover:bg-white/2 transition-colors">
                <td className="py-2.5 pr-4 text-gray-300">{formatDate(log.date || log.id)}</td>
                <td className={`py-2.5 pr-4 font-semibold ${colorClass}`}>{(log.totalCO2 ?? 0).toFixed(2)} kg</td>
                <td className="py-2.5 pr-4 text-gray-400">{(log.categories?.transport?.co2 ?? 0).toFixed(2)}</td>
                <td className="py-2.5 pr-4 text-gray-400">{(log.categories?.food?.co2      ?? 0).toFixed(2)}</td>
                <td className="py-2.5 pr-4 text-gray-400">{(log.categories?.energy?.co2    ?? 0).toFixed(2)}</td>
                <td className="py-2.5">
                  <span className={`badge-pill text-[10px] ${getCarbonLabel(log.totalCO2 ?? 0).bgClass} ${colorClass}`}>
                    {label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
