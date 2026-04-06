import { PlayerStats } from './database';

export type LeaderboardType = 'highScore' | 'maxWave' | 'totalKills' | 'totalPlayTime' | 'achievements';

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  metadata?: {
    wave?: number;
    kills?: number;
    playtime?: number;
    achievementCount?: number;
    score?: number;
    highScore?: number;
    runs?: number;
  };
  timestamp: number;
}

export interface LeaderboardData {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

class LeaderboardService {
  private static instance: LeaderboardService;
  private cache: Map<LeaderboardType, LeaderboardData> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Build leaderboard from player stats
   * In production, this would aggregate data from database with proper queries
   */
  buildLeaderboard(
    playersList: PlayerStats[],
    type: LeaderboardType,
    limit: number = 100
  ): LeaderboardEntry[] {
    let entries: LeaderboardEntry[] = [];

    switch (type) {
      case 'highScore':
        entries = playersList
          .map(p => ({
            rank: 0,
            uid: p.uid,
            displayName: p.displayName,
            photoURL: p.photoURL,
            score: p.highScore,
            metadata: { wave: p.maxWave },
            timestamp: p.updatedAt,
          }))
          .sort((a, b) => b.score - a.score);
        break;

      case 'maxWave':
        entries = playersList
          .map(p => ({
            rank: 0,
            uid: p.uid,
            displayName: p.displayName,
            photoURL: p.photoURL,
            score: p.maxWave,
            metadata: { score: p.highScore },
            timestamp: p.updatedAt,
          }))
          .sort((a, b) => b.score - a.score);
        break;

      case 'totalKills':
        entries = playersList
          .map(p => ({
            rank: 0,
            uid: p.uid,
            displayName: p.displayName,
            photoURL: p.photoURL,
            score: p.totalKills,
            metadata: { highScore: p.highScore, playtime: p.totalPlayTime },
            timestamp: p.updatedAt,
          }))
          .sort((a, b) => b.score - a.score);
        break;

      case 'totalPlayTime':
        entries = playersList
          .map(p => ({
            rank: 0,
            uid: p.uid,
            displayName: p.displayName,
            photoURL: p.photoURL,
            score: p.totalPlayTime,
            metadata: { highScore: p.highScore, runs: p.totalRuns },
            timestamp: p.updatedAt,
          }))
          .sort((a, b) => b.score - a.score);
        break;

      case 'achievements':
        entries = playersList
          .map(p => ({
            rank: 0,
            uid: p.uid,
            displayName: p.displayName,
            photoURL: p.photoURL,
            score: p.achievements.length,
            metadata: { highScore: p.highScore, achievementCount: p.achievements.length },
            timestamp: p.updatedAt,
          }))
          .sort((a, b) => b.score - a.score);
        break;
    }

    // Add ranks
    entries = entries.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    console.log('[v0] Built leaderboard:', type, 'with', entries.length, 'entries');
    return entries;
  }

  /**
   * Get cached leaderboard or build new one
   */
  getLeaderboard(
    playersList: PlayerStats[],
    type: LeaderboardType,
    limit?: number
  ): LeaderboardEntry[] {
    const cached = this.cache.get(type);
    const now = Date.now();

    if (cached && now - cached.lastUpdated < this.cacheTimeout) {
      console.log('[v0] Using cached leaderboard:', type);
      return cached.entries;
    }

    const entries = this.buildLeaderboard(playersList, type, limit);
    this.cache.set(type, {
      type,
      entries,
      lastUpdated: now,
    });

    return entries;
  }

  /**
   * Get player rank on a specific leaderboard
   */
  getPlayerRank(
    playersList: PlayerStats[],
    type: LeaderboardType,
    uid: string
  ): number | null {
    const leaderboard = this.getLeaderboard(playersList, type);
    const entry = leaderboard.find(e => e.uid === uid);
    return entry ? entry.rank : null;
  }

  /**
   * Get top players around a specific player
   */
  getPlayerRegion(
    playersList: PlayerStats[],
    type: LeaderboardType,
    uid: string,
    range: number = 5
  ): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard(playersList, type);
    const playerRank = leaderboard.findIndex(e => e.uid === uid);

    if (playerRank === -1) return [];

    const start = Math.max(0, playerRank - range);
    const end = Math.min(leaderboard.length, playerRank + range + 1);

    return leaderboard.slice(start, end);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[v0] Leaderboard cache cleared');
  }

  /**
   * Format leaderboard entry for display
   */
  formatEntry(entry: LeaderboardEntry, type: LeaderboardType): string {
    let score = entry.score.toString();
    let label = 'Score';

    switch (type) {
      case 'highScore':
        label = 'High Score';
        break;
      case 'maxWave':
        label = 'Wave';
        break;
      case 'totalKills':
        label = 'Kills';
        score = entry.score.toLocaleString();
        break;
      case 'totalPlayTime':
        label = 'Playtime (h)';
        score = (entry.score / 3600000).toFixed(1);
        break;
      case 'achievements':
        label = 'Achievements';
        break;
    }

    return `${entry.rank}. ${entry.displayName} - ${score} ${label}`;
  }
}

export const leaderboardService = LeaderboardService.getInstance();
