import React, { useState } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import DailyLogger from '../components/logger/DailyLogger';
import { saveDailyLog, updateUserStats, upsertLeaderboardEntry, updateChallengeProgress } from '../services/firestore';
import { generateDailyInsight } from '../services/gemini';
import { updateStatsFromLog, computeEarnedBadges } from '../utils/badgeLogic';
import { getTodayStr, getWeekId, formatDateFull } from '../utils/dateUtils';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Logger() {
  const { user, profile, stats, todayLog, setStats, showToast, getRecentAvgCO2 } = useAppStore();
  const [saving,    setSaving]    = useState(false);
  const [savedData, setSavedData] = useState(null);

  const todayStr       = getTodayStr();
  const alreadyLogged  = todayLog?.date === todayStr || todayLog?.id === todayStr;

  async function handleSubmit(entries, totals) {
    if (saving) return;
    setSaving(true);
    try {
      // Generate Gemini insight
      const insight = await generateDailyInsight(entries, totals.total, profile);

      const logPayload = {
        date:       todayStr,
        transport:  entries.transport,
        food:       entries.food,
        energy:     entries.energy,
        shopping:   entries.shopping,
        categories: {
          transport: { co2: totals.transport },
          food:      { co2: totals.food      },
          energy:    { co2: totals.energy    },
          shopping:  { co2: totals.shopping  },
        },
        totalCO2:      totals.total,
        geminiInsight: insight.insight,
        geminiTip:     insight.tip,
        encouragement: insight.encouragement,
      };

      // Save log
      await saveDailyLog(user.uid, logPayload);

      // Update stats
      const newStats  = updateStatsFromLog(stats, { ...entries, totalCO2: totals.total }, stats?.lastLogDate);
      const newBadges = computeEarnedBadges(newStats);
      await updateUserStats(user.uid, { ...newStats, badgesEarned: newBadges });
      setStats({ ...newStats, badgesEarned: newBadges });

      // Update leaderboard entry (use rolling weekly average, not single day)
      const nickname = profile?.nickname || 'Anonymous';
      const weekAvg  = getRecentAvgCO2 ? getRecentAvgCO2() : totals.total;
      await upsertLeaderboardEntry(user.uid, getWeekId(), {
        displayName: nickname,
        weeklyAvg:   parseFloat(weekAvg.toFixed(2)),
      });

      // Update challenge progress based on today's log
      await updateChallengeProgress(user.uid, logPayload);

      setSavedData({ totals, insight });
      showToast('✅ Log saved! Your AI insight is ready.');
    } catch (e) {
      console.error(e);
      showToast('Failed to save log. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (savedData) {
    return (
      <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-2xl mx-auto animate-fade-in">
        <div className="glass-card p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Log Saved! 🎉</h2>
          <p className="text-gray-400">Your carbon footprint for {formatDateFull(todayStr)}</p>
          <div className="mt-6 p-4 rounded-2xl bg-carbon-800/60">
            <p className="text-4xl font-black text-white mb-1">{savedData.totals.total.toFixed(2)}<span className="text-lg text-gray-400 font-normal"> kg CO₂</span></p>
            <p className="text-sm text-gray-500">
              {savedData.totals.total < 4.7 ? `🌿 ${(4.7 - savedData.totals.total).toFixed(2)} kg below global average` : `⚠️ ${(savedData.totals.total - 4.7).toFixed(2)} kg above global average`}
            </p>
          </div>
        </div>

        {savedData.insight && (
          <div className="glass-card p-6 mb-4 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">🤖 AI Insight</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{savedData.insight.insight}</p>
            {savedData.insight.tip && (
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <p className="text-xs font-semibold text-teal-400 mb-1">💡 Tip for tomorrow</p>
                <p className="text-sm text-gray-300">{savedData.insight.tip}</p>
              </div>
            )}
            {savedData.insight.encouragement && (
              <p className="text-sm text-green-300 italic">"{savedData.insight.encouragement}"</p>
            )}
          </div>
        )}

        <button onClick={() => setSavedData(null)} className="btn-secondary w-full">
          <RefreshCw className="w-4 h-4" />
          Log Another Entry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Log Today's Activities</h1>
        <p className="text-gray-400 text-sm mt-1">{formatDateFull(todayStr)}</p>
      </div>

      {alreadyLogged && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-300">Already logged today ({todayLog?.totalCO2?.toFixed(2)} kg CO₂)</p>
            <p className="text-xs text-gray-500">You can log again to update your entry</p>
          </div>
        </div>
      )}

      {saving ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <PageLoader />
          <p className="text-sm text-gray-400">Saving and generating AI insight...</p>
        </div>
      ) : (
        <div className="glass-card p-4 md:p-6">
          <DailyLogger onSubmit={handleSubmit} initialData={alreadyLogged ? todayLog : {}} />
        </div>
      )}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-forest-800 border-t-green-500 animate-spin" />
        </div>
      </div>
    </div>
  );
}
