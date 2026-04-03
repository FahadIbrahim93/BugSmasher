import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Configure authentication persistence
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('Failed to set persistence:', err);
});

// Configure providers with custom scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.addScope('read:user');

export const discordProvider = new OAuthProvider('oidc.discord');
discordProvider.addScope('identify');
discordProvider.addScope('email');

// Type-safe authentication utilities
export async function signInWithProvider(provider: GoogleAuthProvider | GithubAuthProvider | OAuthProvider) {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot };
