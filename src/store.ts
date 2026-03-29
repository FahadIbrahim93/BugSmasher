import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserData } from './types';

export let userData: UserData = {
  uid: '',
  bestScore: 0,
  bestWave: 0,
  bestCombo: 0,
  runs: 0,
  achievements: [],
  totalGemsCollected: 0,
  totalKills: 0,
};

export let unlockedAchievements = new Set<string>();

enum OperationType {
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    providerInfo: Array<{
      providerId: string;
      displayName: string | null;
    }>;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function loadUserData(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserData>;
      userData = { ...userData, ...data, uid };
      unlockedAchievements = new Set(userData.achievements || []);
      return;
    }

    userData.uid = uid;
    await saveUserData(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserData(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    userData.uid = uid;
    userData.achievements = Array.from(unlockedAchievements);
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, userData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
