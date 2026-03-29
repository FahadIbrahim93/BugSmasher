import { auth } from './firebase';
import { dbService, PlayerStats } from './services/database';
import { User } from 'firebase/auth';

export let userData: PlayerStats | null = null;
export let currentUser: User | null = null;
export let unlockedAchievements = new Set<string>();

/**
 * Load user data from database
 */
export async function loadUserData(uid: string) {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      console.warn('[v0] User mismatch or not authenticated');
      return;
    }

    currentUser = user;
    const stats = await dbService.getPlayerStats(uid);
    
    if (stats) {
      userData = stats;
      unlockedAchievements = new Set(stats.achievements || []);
      console.log('[v0] User data loaded successfully');
    } else {
      // Create new player stats if none exist
      const newStats: PlayerStats = {
        uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || undefined,
        provider: user.providerData[0]?.providerId || 'unknown',
        totalRuns: 0,
        totalScore: 0,
        totalKills: 0,
        highScore: 0,
        maxWave: 0,
        totalPlayTime: 0,
        averageScore: 0,
        favoriteClass: '',
        lastPlayTime: Date.now(),
        achievements: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await dbService.savePlayerStats(user, newStats);
      userData = newStats;
      console.log('[v0] New player stats created');
    }
  } catch (error) {
    console.error('[v0] Failed to load user data:', error);
    throw error;
  }
}

/**
 * Save user data to database
 */
export async function saveUserData(uid: string, stats?: Partial<PlayerStats> | PlayerStats) {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      console.warn('[v0] User mismatch or not authenticated');
      return;
    }

    if (!userData) {
      console.warn('[v0] No user data to save');
      return;
    }

    const mergedStats = { ...userData, ...(stats || {}) } as PlayerStats;
    await dbService.savePlayerStats(user, mergedStats);
    userData = mergedStats;
    
    console.log('[v0] User data saved successfully');
  } catch (error) {
    console.error('[v0] Failed to save user data:', error);
    throw error;
  }
}

/**
 * Get current player stats
 */
export function getPlayerStats(): PlayerStats | null {
  return userData;
}

/**
 * Update player stats locally
 */
export function updatePlayerStatsLocally(updates: Partial<PlayerStats>) {
  if (userData) {
    userData = { ...userData, ...updates, updatedAt: Date.now() };
  }
}

/**
 * Clear user data
 */
export function clearUserData() {
  userData = null;
  currentUser = null;
  unlockedAchievements.clear();
  console.log('[v0] User data cleared');
}
