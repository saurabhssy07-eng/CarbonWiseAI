import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// ─── Placeholder detection ────────────────────────────────────────────────────
function isPlaceholder(val) {
  if (!val || val === undefined) return true;
  const s = String(val).trim();
  return (
    s === '' ||
    s.startsWith('your_') ||
    s.startsWith('your-') ||
    s === 'undefined'
  );
}

const requiredKeys = [
  import.meta.env.VITE_FIREBASE_API_KEY,
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
];

// FIREBASE_READY = true only when real (non-placeholder) keys are present
export const FIREBASE_READY = requiredKeys.every((k) => !isPlaceholder(k));

let auth      = null;
let db        = null;
let app       = null;
let analytics = null;

if (FIREBASE_READY) {
  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);

  // Analytics (only in browser, graceful fallback)
  isSupported().then((supported) => {
    if (supported && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app);
      console.log('[CarbonWise] ✅ Firebase Analytics initialised');
    }
  });

  console.log('[CarbonWise] ✅ Firebase connected → project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
} else {
  console.warn(
    '[CarbonWise] ⚠️  Firebase not configured — running in DEMO MODE.\n' +
    'Add your Firebase keys to .env.local to enable Auth & Firestore.\n' +
    'See README.md for setup instructions.'
  );
}

export { auth, db, analytics };
export default app;
