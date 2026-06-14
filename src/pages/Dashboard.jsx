import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, TrendingDown, TrendingUp, Flame, Leaf, Award } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import CarbonGauge from '../components/dashboard/CarbonGauge';
import { TrendChart, CategoryBreakdownChart } from '../components/dashboard/TrendChart';
import { getCarbonScore, getCarbonLabel } from '../utils/carbonCalculator';
import { BADGES } from '../utils/co2Constants';
import { formatDate, getTodayStr } from '../utils/dateUtils';
import { getBadgeProgress } from '../utils/badgeLogic';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { BENCHMARKS } from '../utils/co2Constants';
import WelcomeTips from '../components/dashboard/WelcomeTips';

export default function Dashboard() {
  const { user, profile, stats, logs, todayLog } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <PageLoader />;

  const todayKg    = todayLog?.totalCO2 ?? 0;
  const score      = getCarbonScore(todayKg);
  const { label, colorClass } = getCarbonLabel(todayKg);
  const weekAvg    = logs.slice(0, 7).reduce((s, l) => s + (l.totalCO2 ?? 0), 0) / Math.max(logs.slice(0,7).length, 1);
  const badgeList  = getBadgeProgress(stats);
  const earnedBadges = badgeList.filter((b) => b.earned);

  const todayStr   = getTodayStr();
  const hasLoggedToday = todayLog?.date === todayStr || todayLog?.id === todayStr;

  // Show onboarding tips in first week (< 8 logs)
  const onboardingTips = profile?.baselineTips ?? [];
  const showTips       = onboardingTips.length > 0 && (stats?.totalLogs ?? 0) < 8;

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Hey, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        {!hasLoggedToday && (
          <Link to="/log" className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
            <PlusCircle className="w-4 h-4" />
            Log Today
          </Link>
        )}
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Today's CO₂",
            value: todayKg > 0 ? `${todayKg} kg` : '—',
            sub:   todayKg > 0 ? (todayKg < BENCHMARKS.GLOBAL_AVERAGE ? '✅ Below average' : '⚠️ Above average') : 'Not logged yet',
            icon:  Leaf,
            color: todayKg > 0 && todayKg < BENCHMARKS.GLOBAL_AVERAGE ? 'text-green-400' : 'text-yellow-400',
          },
          {
            label: '7-Day Average',
            value: logs.length ? `${weekAvg.toFixed(1)} kg` : '—',
            sub:   'per day',
            icon:  weekAvg < BENCHMARKS.GLOBAL_AVERAGE ? TrendingDown : TrendingUp,
            color: weekAvg < BENCHMARKS.GLOBAL_AVERAGE ? 'text-green-400' : 'text-orange-400',
          },
          {
            label: 'Current Streak',
            value: stats?.currentStreak ? `${stats.currentStreak} 🔥` : '0',
            sub:   'days in a row',
            icon:  Flame,
            color: 'text-orange-400',
          },
          {
            label: 'CO₂ Saved',
            value: stats?.lifetimeCO2Saved ? `${stats.lifetimeCO2Saved.toFixed(1)} kg` : '0 kg',
            sub:   'vs global average',
            icon:  Award,
            color: 'text-teal-400',
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon className={`w-4 h-4 ${color} mb-1`} />
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-600">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Carbon Gauge */}
        <div className="glass-card p-6">
          <h2 className="section-title">Carbon Score</h2>
          <CarbonGauge score={score} dailyKg={todayKg} />
          {!hasLoggedToday && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <p className="text-sm text-green-300">Log today's activities to update your score</p>
              <Link to="/log" className="text-xs text-green-400 font-semibold hover:text-green-300 mt-1 inline-block">
                → Log Now
              </Link>
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="section-title">AI Insight</h2>
          {todayLog?.geminiInsight ? (
            <div className="flex-1 space-y-4">
              <div className="p-4 rounded-xl bg-carbon-800/60 border border-white/5">
                <p className="text-sm text-gray-200 leading-relaxed">💬 {todayLog.geminiInsight}</p>
              </div>
              {todayLog?.geminiTip && (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <p className="text-xs font-semibold text-teal-400 mb-1">💡 Today's Tip</p>
                  <p className="text-sm text-gray-300">{todayLog.geminiTip}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <div className="text-4xl mb-3 animate-bounce-gentle">🤖</div>
              <p className="text-sm text-gray-400 mb-4">Log your activities to get personalized AI insights powered by Gemini</p>
              <Link to="/log" className="btn-primary text-sm py-2 px-5">
                Get My AI Insight
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Trend chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">14-Day Trend</h2>
          <Link to="/history" className="text-xs text-green-400 hover:text-green-300">View all →</Link>
        </div>
        <TrendChart logs={logs} />
      </div>

      {/* Onboarding Tips (first week only) */}
      {showTips && (
        <WelcomeTips
          tips={onboardingTips}
          baselineKg={profile?.baselineProfile?.baselineCO2}
        />
      )}

      {/* Today's breakdown + Badges */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="glass-card p-6">
          <h2 className="section-title">Today's Breakdown</h2>
          {todayLog ? (
            <CategoryBreakdownChart logData={{
              transport: todayLog.categories?.transport?.co2 ?? 0,
              food:      todayLog.categories?.food?.co2      ?? 0,
              energy:    todayLog.categories?.energy?.co2    ?? 0,
              shopping:  todayLog.categories?.shopping?.co2  ?? 0,
            }} />
          ) : (
            <div className="flex items-center justify-center h-36 text-gray-500 text-sm">
              Log today to see breakdown
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Badges</h2>
            <span className="text-xs text-gray-500">{earnedBadges.length}/{BADGES.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {badgeList.slice(0, 8).map((badge) => (
              <div key={badge.id} className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${badge.earned ? 'bg-green-500/10 border border-green-500/20' : 'bg-carbon-800/40 border border-white/5 opacity-40 grayscale'}`}
                   title={badge.desc}>
                <span className="text-xl mb-1">{badge.icon}</span>
                <p className="text-[10px] text-gray-400 leading-tight">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
