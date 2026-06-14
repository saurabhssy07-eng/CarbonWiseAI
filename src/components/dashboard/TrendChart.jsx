import React from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import { formatDate } from '../../utils/dateUtils';
import { BENCHMARKS, CATEGORY_COLORS } from '../../utils/co2Constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value} kg
        </p>
      ))}
    </div>
  );
};

export function TrendChart({ logs = [] }) {
  const data = [...logs].reverse().slice(-14).map((l) => ({
    date:  formatDate(l.date || l.id),
    total: l.totalCO2 ?? 0,
    avg:   BENCHMARKS.GLOBAL_AVERAGE,
  }));

  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
      Log some days to see your trend
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={BENCHMARKS.GLOBAL_AVERAGE} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4"
                       label={{ value: 'Global avg', fill: '#ef4444', fontSize: 9, position: 'right' }} />
        <ReferenceLine y={BENCHMARKS.PARIS_TARGET} stroke="rgba(34,197,94,0.4)" strokeDasharray="4 4"
                       label={{ value: 'Paris target', fill: '#22c55e', fontSize: 9, position: 'right' }} />
        <Area type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} fill="url(#totalGrad)" name="CO₂" dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBreakdownChart({ logData }) {
  if (!logData) return (
    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">No data yet</div>
  );

  const data = [
    { name: 'Transport', value: logData.transport ?? 0, color: CATEGORY_COLORS.transport },
    { name: 'Food',      value: logData.food      ?? 0, color: CATEGORY_COLORS.food      },
    { name: 'Energy',    value: logData.energy    ?? 0, color: CATEGORY_COLORS.energy    },
    { name: 'Shopping',  value: logData.shopping  ?? 0, color: CATEGORY_COLORS.shopping  },
  ].filter((d) => d.value > 0);

  if (!data.length) return (
    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">Log today to see breakdown</div>
  );

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="CO₂" radius={[6,6,0,0]}
             fill="#22c55e"
             label={{ position: 'top', fill: '#6b7280', fontSize: 9, formatter: (v) => v > 0 ? `${v.toFixed(1)}` : '' }}>
          {data.map((entry, i) => (
            <rect key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyBarChart({ logs = [] }) {
  const data = [...logs].reverse().slice(-7).map((l) => ({
    day:  formatDate(l.date || l.id),
    transport: l.categories?.transport?.co2 ?? 0,
    food:      l.categories?.food?.co2      ?? 0,
    energy:    l.categories?.energy?.co2    ?? 0,
    shopping:  l.categories?.shopping?.co2  ?? 0,
  }));

  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No weekly data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="transport" name="Transport" stackId="a" fill={CATEGORY_COLORS.transport} radius={[0,0,0,0]} />
        <Bar dataKey="food"      name="Food"      stackId="a" fill={CATEGORY_COLORS.food}      />
        <Bar dataKey="energy"    name="Energy"    stackId="a" fill={CATEGORY_COLORS.energy}    />
        <Bar dataKey="shopping"  name="Shopping"  stackId="a" fill={CATEGORY_COLORS.shopping}  radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
