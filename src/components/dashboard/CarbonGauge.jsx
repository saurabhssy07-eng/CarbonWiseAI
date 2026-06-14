import React, { useEffect, useRef, useState } from 'react';
import { getScoreColor, getCarbonLabel, getCarbonScore } from '../../utils/carbonCalculator';
import { BENCHMARKS } from '../../utils/co2Constants';

export default function CarbonGauge({ score = 0, dailyKg = 0, animated = true }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayKg, setDisplayKg]       = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!animated) { setDisplayScore(score); setDisplayKg(dailyKg); return; }
    const duration = 1200;
    const start    = Date.now();
    const startScore = 0;
    const startKg    = 0;

    function tick() {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayScore(Math.round(startScore + (score - startScore) * ease));
      setDisplayKg(Math.round((startKg + (dailyKg - startKg) * ease) * 100) / 100);
      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [score, dailyKg, animated]);

  const { label, colorClass, hex } = getCarbonLabel(dailyKg);
  const scoreColor  = getScoreColor(score);

  // SVG Arc
  const cx = 100, cy = 100, r = 80;
  const startAngle = -220, endAngle = 40;
  const totalAngle = endAngle - startAngle; // 260 degrees
  const scoreAngle = startAngle + (displayScore / 100) * totalAngle;

  function polarToXY(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startDeg, endDeg) {
    const s  = polarToXY(cx, cy, r, startDeg);
    const e  = polarToXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fillPath  = describeArc(cx, cy, r, startAngle, scoreAngle);
  const needle    = polarToXY(cx, cy, r - 10, scoreAngle);

  // Benchmark markers
  const markers = [
    { kg: BENCHMARKS.EXCELLENT,      label: 'Great',    angle: startAngle + (getScoreForKg(BENCHMARKS.EXCELLENT) / 100) * totalAngle },
    { kg: BENCHMARKS.PARIS_TARGET,   label: 'Paris',    angle: startAngle + (getScoreForKg(BENCHMARKS.PARIS_TARGET) / 100) * totalAngle },
    { kg: BENCHMARKS.GLOBAL_AVERAGE, label: 'Avg',      angle: startAngle + (getScoreForKg(BENCHMARKS.GLOBAL_AVERAGE) / 100) * totalAngle },
  ];

  function getScoreForKg(kg) {
    return getCarbonScore(kg);
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 160" className="w-full max-w-[260px]">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="33%"  stopColor="#f97316" />
            <stop offset="60%"  stopColor="#eab308" />
            <stop offset="80%"  stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />

        {/* Fill */}
        <path d={fillPath} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" filter="url(#glow)" />

        {/* Benchmark ticks */}
        {markers.map((m) => {
          const inner = polarToXY(cx, cy, r - 20, m.angle);
          const outer = polarToXY(cx, cy, r + 4,  m.angle);
          return (
            <line key={m.label}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          );
        })}

        {/* Needle dot */}
        <circle cx={needle.x} cy={needle.y} r="6" fill={scoreColor} filter="url(#glow)" />
        <circle cx={needle.x} cy={needle.y} r="3" fill="white" />

        {/* Center display */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={scoreColor} fontSize="32" fontWeight="800" fontFamily="Inter">
          {displayScore}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Inter">
          CARBON SCORE
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="600" fontFamily="Inter">
          {displayKg} kg CO₂
        </text>

        {/* Labels */}
        <text x={20} y={148} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="Inter">Low</text>
        <text x={180} y={148} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="Inter">High</text>
      </svg>

      {/* Label badge */}
      <span className={`badge-pill mt-1 ${getCarbonLabel(dailyKg).bgClass} ${getCarbonLabel(dailyKg).colorClass} border border-current/20 font-semibold text-sm`}>
        {label}
      </span>
      <p className="text-xs text-gray-500 mt-1.5">
        {dailyKg < BENCHMARKS.GLOBAL_AVERAGE
          ? `${(BENCHMARKS.GLOBAL_AVERAGE - dailyKg).toFixed(2)} kg below global average`
          : `${(dailyKg - BENCHMARKS.GLOBAL_AVERAGE).toFixed(2)} kg above global average`}
      </p>
    </div>
  );
}
