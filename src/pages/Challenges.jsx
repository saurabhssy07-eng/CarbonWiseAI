import React, { useEffect, useState } from 'react';
import { Trophy, Users, CheckCircle, Clock, Loader2, TrendingDown, Award } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Challenges ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-400 bg-red-900/20 rounded-xl m-4 border border-red-500/30 overflow-auto">
          <h2 className="text-xl font-bold mb-2">Challenges Page Crashed</h2>
          <p className="font-mono text-sm mb-4">{this.state.error && this.state.error.toString()}</p>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap">
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import useAppStore from '../store/useAppStore';
import {
  subscribeToChallenges,
  subscribeToLeaderboard,
  joinChallenge,
  seedChallengesIfNeeded,
  getChallengeProgress,
} from '../services/firestore';
import { FIREBASE_READY } from '../services/firebase';
import { CHALLENGE_DEFINITIONS } from '../services/firestore';
import { getWeekId, getWeekStartEnd, formatDate } from '../utils/dateUtils';

// ── Fallback data when Firebase not configured ────────────────────────────────
const FALLBACK_LEADERBOARD = [
  { id: 'eco1',  displayName: 'EcoWanderer',  weeklyAvg: 1.8,  badges: ['🏆','🌱'] },
  { id: 'eco2',  displayName: 'GreenSpark',   weeklyAvg: 2.3,  badges: ['⚡']       },
  { id: 'eco3',  displayName: 'LeafWalker',   weeklyAvg: 2.9,  badges: ['🌿','🔥']  },
  { id: 'eco4',  displayName: 'SolarRider',   weeklyAvg: 3.1,  badges: ['☀️']       },
  { id: 'eco5',  displayName: 'TerraStep',    weeklyAvg: 4.0,  badges: []           },
];

const DIFF_COLORS = {
  Easy:   'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard:   'text-red-400   bg-red-500/10   border-red-500/20',
};

const CAT_COLORS = {
  Transport: 'bg-blue-500/20 text-blue-400',
  Food:      'bg-green-500/20 text-green-400',
  Energy:    'bg-yellow-500/20 text-yellow-400',
  Shopping:  'bg-purple-500/20 text-purple-400',
};

function ChallengesComponent() {
  const { user, getRecentAvgCO2, showToast } = useAppStore();
  const [tab,        setTab]        = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [leaderboard,setLeaderboard]= useState([]);
  const [progress,   setProgress]   = useState({});   // { challengeId: [{date, passed}] }
  const [loading,    setLoading]    = useState(true);
  const [joining,    setJoining]    = useState(null);  // currently-joining challenge id

  const weekAvg  = getRecentAvgCO2();
  const weekId   = getWeekId();
  const { start, end } = getWeekStartEnd();

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let unsubC = () => {};
    let unsubL = () => {};

    (async () => {
      try {
        await seedChallengesIfNeeded();

        // Subscribe to challenges
        unsubC = subscribeToChallenges((data) => {
          // Merge with local checkFn definitions
          const enriched = data.map((c) => {
            const def = CHALLENGE_DEFINITIONS.find((d) => d.id === c.id);
            return { ...c, checkFn: def?.checkFn };
          });
          setChallenges(enriched);
          setLoading(false);
        });

        // Subscribe to leaderboard
        unsubL = subscribeToLeaderboard(weekId, (data) => {
          setLeaderboard(data);
        });

        // Load challenge progress
        if (user?.uid) {
          const prog = await getChallengeProgress(user?.uid);
          setProgress(prog);
        }
      } catch (err) {
        console.error('Error bootstrapping challenges:', err);
        setLoading(false);
      }
    })();

    return () => { unsubC(); unsubL(); };
  }, [user?.uid, weekId]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isJoined = (c) => (c.participants ?? []).includes(user?.uid);

  function getDaysLeft(endDate) {
    if (!endDate) return 0;
    const end = endDate?.toDate ? endDate.toDate() : new Date(endDate);
    if (isNaN(end.getTime())) return 0;
    return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  }

  function getProgressCount(challengeId) {
    const records = progress[challengeId] ?? [];
    return records.filter((r) => r.passed).length;
  }

  async function handleJoin(challenge) {
    if (isJoined(challenge) || joining) return;
    setJoining(challenge.id);
    try {
      await joinChallenge(user.uid, challenge.id);
      showToast(`✅ Joined "${challenge.title}"!`);
      // Reload progress to show retroactive checks from today's log
      const prog = await getChallengeProgress(user.uid);
      setProgress(prog);
    } catch (e) {
      showToast('Failed to join. Please try again.', 'error');
    } finally {
      setJoining(null);
    }
  }

  // ── Build leaderboard with current user ────────────────────────────────────
  const userEntry = { id: user?.uid, displayName: 'You', weeklyAvg: weekAvg, isUser: true, badges: [] };
  const hasUserEntry = leaderboard.some((e) => e.id === user?.uid);

  let fullLeaderboard = [];
  try {
    fullLeaderboard = FIREBASE_READY
      ? [...(hasUserEntry ? leaderboard : [...leaderboard, userEntry])]
          .sort((a, b) => (a.weeklyAvg ?? 999) - (b.weeklyAvg ?? 999))
          .map((e, i) => ({ ...e, rank: i + 1 }))
      : [...FALLBACK_LEADERBOARD, { ...userEntry, weeklyAvg: parseFloat(Number(weekAvg).toFixed(2)) || 0 }]
          .sort((a, b) => (a.weeklyAvg ?? 999) - (b.weeklyAvg ?? 999))
          .map((e, i) => ({ ...e, rank: i + 1 }));
  } catch (err) {
    console.error("Error building leaderboard:", err);
  }

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-8 pb-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Challenges & Leaderboard</h1>
        <p className="text-gray-400 text-sm mt-1">Week of {formatDate(start)} – {formatDate(end)}</p>
      </div>

      {/* Tab */}
      <div className="flex gap-2 p-1 bg-carbon-800/60 rounded-xl w-fit">
        {['challenges', 'leaderboard'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'challenges' ? '🏅 Challenges' : '🏆 Leaderboard'}
          </button>
        ))}
      </div>

      {/* ── Challenges Tab ─────────────────────────────────────────────────── */}
      {tab === 'challenges' && (
        loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading challenges...
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((c) => {
              const joined      = isJoined(c);
              const daysLeft    = getDaysLeft(c.endDate);
              const passedDays  = getProgressCount(c.id);
              const participants = (c.participants ?? []).length;

              return (
                <div key={c.id} className={`glass-card p-5 transition-all ${joined ? 'border-green-500/20' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-semibold text-white">{c.title}</h3>
                        <span className={`badge-pill border text-[10px] ${DIFF_COLORS[c.difficulty] ?? ''}`}>{c.difficulty}</span>
                        <span className={`badge-pill text-[10px] ${CAT_COLORS[c.category] ?? 'bg-carbon-700 text-gray-400'}`}>{c.category}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{c.description}</p>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{daysLeft}d left</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {/* Real participant count from Firestore */}
                          {participants} joined
                        </span>
                        <span className="text-green-400">Save ~{c.targetCO2Reduction} kg CO₂</span>
                      </div>

                      {/* Progress bar (only if joined) */}
                      {joined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">Your progress</span>
                            <span className="text-green-400 font-medium">{passedDays} / 7 days ✓</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-green-500 transition-all duration-500"
                                 style={{ width: `${Math.round((passedDays / 7) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Join button */}
                    <button
                      onClick={() => handleJoin(c)}
                      disabled={joined || joining === c.id}
                      className={`shrink-0 text-sm py-2 px-4 ${joined ? 'btn-secondary opacity-80' : 'btn-primary'}`}>
                      {joining === c.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : joined
                          ? <><CheckCircle className="w-4 h-4" /> Joined</>
                          : 'Join'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Leaderboard Tab ────────────────────────────────────────────────── */}
      {tab === 'leaderboard' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-500">Average daily CO₂ this week · lower = better · anonymous by default</p>
            {!FIREBASE_READY && <span className="badge-pill bg-amber-500/10 text-amber-400 text-[10px]">Demo data</span>}
          </div>
          <div className="divide-y divide-white/5">
            {fullLeaderboard.map((entry) => (
              <div key={entry.id ?? entry.rank}
                   className={`flex items-center gap-4 px-5 py-4 transition-all ${entry.isUser ? 'bg-green-500/5 border-l-2 border-green-500' : 'hover:bg-white/[0.02]'}`}>
                <div className={`w-8 text-center font-bold text-lg ${entry.rank <= 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${entry.isUser ? 'text-green-300' : 'text-white'}`}>
                    {entry.displayName ?? 'Anonymous'} {entry.isUser && '(You)'}
                  </p>
                  <div className="flex gap-1 mt-0.5">{(entry.badges ?? []).map((b, i) => <span key={i} className="text-xs">{b}</span>)}</div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${entry.isUser ? 'text-green-400' : 'text-gray-300'}`}>
                    {entry.weeklyAvg != null ? `${(+entry.weeklyAvg).toFixed(2)} kg` : '—'}
                  </p>
                  <p className="text-[10px] text-gray-600">daily avg</p>
                </div>
              </div>
            ))}
          </div>
          {fullLeaderboard.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              No entries yet — log today and be the first! 🌿
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Challenges() {
  return (
    <ErrorBoundary>
      <ChallengesComponent />
    </ErrorBoundary>
  );
}
