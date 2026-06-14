import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { auth, FIREBASE_READY } from './firebase';

const googleProvider = FIREBASE_READY ? new GoogleAuthProvider() : null;
if (googleProvider) googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  if (!FIREBASE_READY || !auth) {
    throw new Error('Firebase not configured. Add your keys to .env.local');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut() {
  if (!FIREBASE_READY || !auth) return;
  await firebaseSignOut(auth);
}

export function onAuthStateChanged(callback) {
  if (!FIREBASE_READY || !auth) {
    // Call with null immediately — no user in demo mode
    callback(null);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  if (!FIREBASE_READY || !auth) return null;
  return auth.currentUser;
}
