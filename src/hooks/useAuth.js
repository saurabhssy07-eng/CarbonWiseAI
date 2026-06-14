import { useEffect } from 'react';
import { onAuthStateChanged } from '../services/auth';
import { getUserProfile, createUserProfile, getUserStats } from '../services/firestore';
import { FIREBASE_READY } from '../services/firebase';
import useAppStore from '../store/useAppStore';

// Demo user injected when Firebase is not configured
const DEMO_USER = {
  uid:         'demo-user',
  displayName: 'Demo User',
  email:       'demo@carbonwise.ai',
  photoURL:    null,
};

const DEMO_PROFILE = {
  displayName:        'Demo User',
  email:              'demo@carbonwise.ai',
  photoURL:           null,
  onboardingComplete: true,
  baselineProfile: {
    transportMode: 'car',
    dietType:      'omnivore',
    energySource:  'mixed',
    homeSize:      'medium',
    baselineCO2:   4.2,
  },
};

const DEMO_STATS = {
  totalLogs:        7,
  currentStreak:    3,
  longestStreak:    7,
  lifetimeCO2Saved: 12.4,
  bestDay:          1.8,
  vegDays:          3,
  carFreeDays:      2,
  badgesEarned:     ['first_log', 'low_carbon', 'saver_10'],
  lastLogDate:      new Date().toISOString().split('T')[0],
};

export function useAuth() {
  const { setUser, setProfile, setStats, setAuthInitialized } = useAppStore();

  useEffect(() => {
    if (!FIREBASE_READY) {
      // Inject demo user so the app is explorable without Firebase
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setStats(DEMO_STATS);
      setAuthInitialized(true);
      return;
    }

    const unsub = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName,
            email:       firebaseUser.email,
            photoURL:    firebaseUser.photoURL,
          });
          profile = await getUserProfile(firebaseUser.uid);
        }
        setProfile(profile);
        const stats = await getUserStats(firebaseUser.uid);
        setStats(stats);
      } else {
        setUser(null);
        setProfile(null);
        setStats(null);
      }
      setAuthInitialized(true);
    });
    return unsub;
  }, []);

  return { user: useAppStore.getState().user };
}
