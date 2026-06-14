import React, { useState } from 'react';
import { FileText, RefreshCw, Star } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { generateWeeklyReport } from '../services/gemini';
import { getLast7Days, formatDate } from '../utils/dateUtils';
import { TrendChart } from '../components/dashboard/TrendChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const GRADE_COLORS = {
  'A+': 'text-green-400 border-green-500/30 bg-green-500/10',
  'A':  'text-green-400 border-green-500/30 bg-green-500/10',
  'B+': 'text-teal-400  border-teal-500/30  bg-teal-500/10',
  'B':  'text-teal-400  border-teal-500/30  bg-teal-500/10',
  'C+': 'text-yellow-400border-yellow-500/30 bg-yellow-500/10',
  'C':  'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  'D':  'text-red-400   border-red-500/30   bg-red-500/10',
};

export default function WeeklyReport() {
  const { logs, stats, profile } = useAppStore();
  const [report,   setReport]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const last7Days = getLast7Days();
  const weekLogs  = logs.filter((l) => last7Days.includes(l.date || l.id));
  const weekAvg   = weekLogs.length
    ? (weekLogs.reduce((s, l) => s + (l.totalCO2 ?? 0), 0) / weekLogs.length).toFixed(2)
    : null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateWeeklyReport(weekLogs, stats, profile);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Weekly Report</h1>
        <p className="text-gray-400 text-sm mt-1">AI-generated summary of your week</p>
      </div>

      {/* Week summary stats */}
      <div className="glass-card p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">This Week's Stats</p>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <p className="text-xl font-bold text-green-400">{weekLogs.length}</p>
            <p className="text-xs text-gray-500">Days Logged</p>
          </div>
          <div>
            <p className="text-xl font-bold text-teal-400">{weekAvg ?? '—'}</p>
            <p className="text-xs text-gray-500">Avg kg/day</p>
          </div>
          <div>
            <p className="text-xl font-bold text-orange-400">{stats?.currentStreak ?? 0}🔥</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
        </div>
        <TrendChart logs={weekLogs} />
      </div>

      {/* Generate button */}
      {!report && (
        <button onClick={handleGenerate} disabled={loading || weekLogs.length === 0}
                className="btn-primary w-full py-4 text-base disabled:opacity-50">
          {loading ? (
            <><LoadingSpinner size="sm" color="white" /> Generating your AI report...</>
          ) : weekLogs.length === 0 ? (
            '📊 Log some days first'
          ) : (
            '🤖 Generate My AI Report'
          )}
        </button>
      )}

      {/* Report card */}
      {report && (
        <div className="space-y-4 animate-slide-up">
          {/* Header card */}
          <div className="glass-card p-6 text-center"
               style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(20,184,166,0.05))' }}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`text-5xl font-black px-5 py-3 rounded-2xl border ${GRADE_COLORS[report.grade] ?? 'text-gray-400 border-gray-700'}`}>
                {report.grade}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{report.score}/100</p>
                <div className="flex gap-1 justify-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(report.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-lg font-semibold text-white">{report.headline}</p>
          </div>

          {/* Report sections */}
          {[
            { key: 'performance', title: '📊 Performance', icon: '📊' },
            { key: 'highlights',  title: '✨ Highlights',  icon: '✨' },
            { key: 'goals',       title: '🎯 Next Week Goals', icon: '🎯' },
          ].map(({ key, title }) => (
            report[key] && (
              <div key={key} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{report[key]}</p>
              </div>
            )
          ))}

          {/* Regenerate */}
          <button onClick={() => { setReport(null); }} className="btn-secondary w-full">
            <RefreshCw className="w-4 h-4" />
            Regenerate Report
          </button>
        </div>
      )}
    </div>
  );
}
