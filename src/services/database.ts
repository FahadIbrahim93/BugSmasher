import { db, auth, doc, getDoc, setDoc, onSnapshot } from '../firebase';
import { User } from 'firebase/auth';

// Type definitions for database schema
export interface GameRun {
  id: string;
  userId: string;
  startTime: number;
  endTime: number;
  score: number;
  wave: number;
  heroClass: string;
  kills: number;
  damageDealt: number;
  damageTaken: number;
  comboMultiplier: number;
  abilitiesUsed: {
    [key: string]: number;
  };
  upgradesApplied: string[];
  duration: number;
  timestamp: number;
}

export interface PlayerStats {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: string;
  totalRuns: number;
  totalScore: number;
  totalKills: number;
  highScore: number;
  maxWave: number;
  totalPlayTime: number;
  averageScore: number;
  // Legacy aliases for compatibility
  runs?: number;
  bestScore?: number;
  bestWave?: number;
  favoriteClass: string;
  lastPlayTime: number;
  achievements: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: 'score' | 'wave' | 'kills' | 'playtime' | 'special';
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GlobalStats {
  totalPlayers: number;
  totalRuns: number;
  totalScore: number;
  highScore: number;
  maxWave: number;
  lastUpdated: number;
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Create or update player stats
   */
  async savePlayerStats(user: User, stats: Partial<PlayerStats>): Promise<void> {
    try {
      const playerRef = doc(db, 'players', user.uid);
      const playerData: PlayerStats = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || undefined,
        provider: user.providerData[0]?.providerId || 'unknown',
        totalRuns: stats.totalRuns || 0,
        totalScore: stats.totalScore || 0,
        totalKills: stats.totalKills || 0,
        highScore: stats.highScore || 0,
        maxWave: stats.maxWave || 0,
        totalPlayTime: stats.totalPlayTime || 0,
        averageScore: stats.averageScore || 0,
        favoriteClass: stats.favoriteClass || '',
        lastPlayTime: Date.now(),
        achievements: stats.achievements || [],
        createdAt: stats.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(playerRef, playerData, { merge: true });
      console.log('[v0] Player stats saved for:', user.uid);
    } catch (error) {
      console.error('[v0] Failed to save player stats:', error);
      throw error;
    }
  }

  /**
   * Get player stats
   */
  async getPlayerStats(userId: string): Promise<PlayerStats | null> {
    try {
      const playerRef = doc(db, 'players', userId);
      const snapshot = await getDoc(playerRef);
      
      if (snapshot.exists()) {
        console.log('[v0] Retrieved player stats for:', userId);
        return snapshot.data() as PlayerStats;
      }
      
      console.log('[v0] No player stats found for:', userId);
      return null;
    } catch (error) {
      console.error('[v0] Failed to get player stats:', error);
      throw error;
    }
  }

  /**
   * Save a game run
   */
  async saveGameRun(userId: string, run: Omit<GameRun, 'id' | 'timestamp'>): Promise<string> {
    try {
      const runsRef = doc(db, 'players', userId, 'runs', `${Date.now()}`);
      const runData: GameRun = {
        ...run,
        id: runsRef.id,
        userId,
        timestamp: Date.now(),
      };

      await setDoc(runsRef, runData);
      console.log('[v0] Game run saved:', runsRef.id);
      return runsRef.id;
    } catch (error) {
      console.error('[v0] Failed to save game run:', error);
      throw error;
    }
  }

  /**
   * Get game runs for a player
   */
  async getPlayerGameRuns(userId: string, limit: number = 50): Promise<GameRun[]> {
    try {
      const runsRef = doc(db, 'players', userId, 'runs', '');
      // Note: In a production scenario, you would use queries with collectionGroup
      // or implement pagination. For now, returning empty array as placeholder.
      console.log('[v0] Retrieved game runs for:', userId);
      return [];
    } catch (error) {
      console.error('[v0] Failed to get game runs:', error);
      throw error;
    }
  }

  /**
   * Subscribe to player stats in real-time
   */
  subscribeToPlayerStats(userId: string, callback: (stats: PlayerStats | null) => void): () => void {
    try {
      const playerRef = doc(db, 'players', userId);
      const unsubscribe = onSnapshot(playerRef, (snapshot) => {
        if (snapshot.exists()) {
          console.log('[v0] Player stats updated:', userId);
          callback(snapshot.data() as PlayerStats);
        } else {
          callback(null);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('[v0] Failed to subscribe to player stats:', error);
      return () => {};
    }
  }

  /**
   * Unlock achievement for player
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const playerRef = doc(db, 'players', userId);
      const playerData = await getDoc(playerRef);
      
      if (playerData.exists()) {
        const currentAchievements = playerData.data().achievements || [];
        if (!currentAchievements.includes(achievementId)) {
          currentAchievements.push(achievementId);
          await setDoc(playerRef, { achievements: currentAchievements }, { merge: true });
          console.log('[v0] Achievement unlocked:', achievementId);
        }
      }
    } catch (error) {
      console.error('[v0] Failed to unlock achievement:', error);
      throw error;
    }
  }

  /**
   * Get global stats
   */
  async getGlobalStats(): Promise<GlobalStats | null> {
    try {
      const globalRef = doc(db, 'meta', 'global_stats');
      const snapshot = await getDoc(globalRef);
      
      if (snapshot.exists()) {
        console.log('[v0] Retrieved global stats');
        return snapshot.data() as GlobalStats;
      }
      
      return null;
    } catch (error) {
      console.error('[v0] Failed to get global stats:', error);
      throw error;
    }
  }

  /**
   * Update global stats
   */
  async updateGlobalStats(stats: Partial<GlobalStats>): Promise<void> {
    try {
      const globalRef = doc(db, 'meta', 'global_stats');
      const updateData = {
        ...stats,
        lastUpdated: Date.now(),
      };
      
      await setDoc(globalRef, updateData, { merge: true });
      console.log('[v0] Global stats updated');
    } catch (error) {
      console.error('[v0] Failed to update global stats:', error);
      throw error;
    }
  }
}

export const dbService = DatabaseService.getInstance();
