import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, doc, getDocFromServer, terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
console.log(`Attempting Firestore connection to: ${firebaseConfig.projectId}...`);
// Use the most aggressive compatibility settings for the preview environment
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: { kind: 'memory' }
}, "(default)");

export const testConnection = async () => {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const testRef = doc(db, 'businesses', 'connection_test');
    await getDoc(testRef);
    console.log("✅ Backend Reachable");
  } catch (err: any) {
    alert("Error: " + err.code);
    console.error("❌ Connection Diagnostic Failed:", err.code, err.message);
  }
};

// Auto-run connection test
testConnection();

// Helper to clear local persistence if we detect a project mismatch or on demand
export async function clearFirebasePersistence() {
  try {
    await terminate(db).catch(() => {});
    await clearIndexedDbPersistence(db).catch(() => {});
    window.location.reload();
  } catch (error) {
    console.error("Failed to clear persistence:", error);
  }
}
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection to ensure a fresh session/debug state
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Analytics lazily
export const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    return result;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    
    let message = "Sign-in failed. Please try again.";
    
    if (error?.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname;
      message = `Unauthorized Domain: Please add "${currentDomain}" to your Firebase Console under Authentication > Settings > Authorized Domains.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    alert(message);
    throw error;
  }
};

export async function checkFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { success: true };
  } catch (error: any) {
    alert("Error: " + error.code);
    console.error("Firestore Connection Failed:", error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error',
      isDatabaseNotFound: error?.message?.includes('Database not found')
    };
  }
}

// Initial check
checkFirebaseConnection();
