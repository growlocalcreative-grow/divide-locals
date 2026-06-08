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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
  userMessage?: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo, null, 2));
  
  // Return a more user-friendly message for common errors
  let userMessage = "Firestore Connection Failed";
  if (errInfo.error.includes('Missing or insufficient permissions')) {
    userMessage = `Permission Denied: Access to ${path} was rejected by security rules.`;
  } else if (errInfo.error.includes('the client is offline')) {
    userMessage = "Network Error: Please check your internet connection or Firebase configuration.";
  }
  
  return { ...errInfo, userMessage };
}

export const auth = getAuth(app);

// Helper to clear local persistence if we detect a project mismatch or on demand
export async function clearFirebasePersistence() {
  try {
    const { terminate, clearIndexedDbPersistence } = await import('firebase/firestore');
    await terminate(db).catch(() => {});
    await clearIndexedDbPersistence(db).catch(() => {});
    window.location.reload();
  } catch (error) {
    console.error("Failed to clear persistence:", error);
  }
}

export const testConnection = async () => {
  const path = '_connection_test_/status';
  try {
    const testRef = doc(db, '_connection_test_', 'status');
    // Using getDocFromServer ensures we skip cache and test real connectivity
    await getDocFromServer(testRef);
    console.log("✅ Firestore Reachable");
    return { success: true };
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.log("ℹ️ Firestore Reachable: Connection test successful (Permission denied as expected for public path)");
      return { success: true };
    }
    const handled = handleFirestoreError(err, OperationType.GET, path);
    console.error("❌ Firestore Connection Failed:", handled.userMessage);
    return { success: false, error: handled.userMessage };
  }
};

// Auto-run connection test
testConnection();
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
