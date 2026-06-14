import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  // Let's get the user ID from the console or assume it's the only one
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, 'saurabhssy07@gmail.com', 'password123').catch(e => console.log(e.message));
  const uid = auth.currentUser?.uid;
  if (!uid) {
    console.log("Could not log in");
    return;
  }
  
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  console.log("PROFILE:", JSON.stringify(docSnap.data(), null, 2));

  // Get today's log
  const todayStr = new Date().toISOString().split('T')[0];
  const logRef = doc(db, 'users', uid, 'dailyLogs', todayStr);
  const logSnap = await getDoc(logRef);
  console.log("TODAY LOG:", JSON.stringify(logSnap.data(), null, 2));
}

run();
