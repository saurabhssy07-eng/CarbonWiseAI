import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  user:    null,
  authInitialized: false,
  setUser: (user) => set({ user }),
  setAuthInitialized: (val) => set({ authInitialized: val }),

  // ── User Profile & Stats ──────────────────────────────────────────────────
  profile: null,
  stats:   null,
  setProfile: (profile) => set({ profile }),
  setStats:   (stats)   => set({ stats }),

  // ── Daily Logs ────────────────────────────────────────────────────────────
  logs:       [],
  todayLog:   null,
  setLogs:    (logs)     => set({ logs, todayLog: logs.find((l) => l.id === new Date().toISOString().split('T')[0]) ?? null }),
  setTodayLog: (log)     => set({ todayLog: log }),

  // ── AI Coach Chat ─────────────────────────────────────────────────────────
  chatMessages: [],
  chatLoading:  false,
  addMessage:   (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatLoading: (v) => set({ chatLoading: v }),
  clearChat:    ()    => set({ chatMessages: [] }),

  // ── UI State ──────────────────────────────────────────────────────────────
  floatingCoachOpen: false,
  setFloatingCoachOpen: (v) => set({ floatingCoachOpen: v }),

  // ── Leaderboard ───────────────────────────────────────────────────────────
  leaderboard: [],
  setLeaderboard: (leaderboard) => set({ leaderboard }),

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [],
  setChallenges: (challenges) => set({ challenges }),

  // ── Notifications / Toast ─────────────────────────────────────────────────
  toast: null,
  showToast: (msg, type = 'success') => {
    set({ toast: { msg, type, id: Date.now() } });
    setTimeout(() => set({ toast: null }), 3500);
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  getRecentAvgCO2: () => {
    const { logs } = get();
    if (!logs.length) return 4.7;
    const last7 = logs.slice(0, 7);
    const sum   = last7.reduce((acc, l) => acc + (l.totalCO2 ?? 0), 0);
    return sum / last7.length;
  },
}));

export default useAppStore;
