/**
 * Advanced Game Statistics Tracker
 * Tracks detailed metrics for analytics and progression
 */

export interface GameStatistics {
  // Run Metadata
  runId: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds

  // Player Performance
  score: number;
  wave: number;
  kills: number;
  damageDealt: number;
  damageTaken: number;
  healingReceived: number;

  // Combat Statistics
  accuracy: number; // percentage of hits that landed
  criticalHits: number;
  dodges: number;
  blockCount: number;

  // Ability Usage
  abilityCasts: {
    [key: string]: number;
  };
  upgradesApplied: string[];

  // Class-specific stats
  heroClass: string;
  classAbilityCounts: {
    [key: string]: number;
  };

  // Economy
  gemsCollected: number;
  goldEarned: number;

  // Multipliers
  maxCombo: number;
  finalComboMultiplier: number;

  // Death Information
  diedAt: {
    wave: number;
    score: number;
    remainingEnemies: number;
  };
}

class StatisticsTracker {
  private static instance: StatisticsTracker;
  private currentRunStats: Partial<GameStatistics> = {};

  private constructor() {}

  static getInstance(): StatisticsTracker {
    if (!StatisticsTracker.instance) {
      StatisticsTracker.instance = new StatisticsTracker();
    }
    return StatisticsTracker.instance;
  }

  /**
   * Initialize a new game run
   */
  startNewRun(runId: string, heroClass: string): void {
    this.currentRunStats = {
      runId,
      startTime: Date.now(),
      score: 0,
      wave: 1,
      kills: 0,
      damageDealt: 0,
      damageTaken: 0,
      healingReceived: 0,
      accuracy: 0,
      criticalHits: 0,
      dodges: 0,
      blockCount: 0,
      abilityCasts: {},
      upgradesApplied: [],
      heroClass,
      classAbilityCounts: {},
      gemsCollected: 0,
      goldEarned: 0,
      maxCombo: 0,
      finalComboMultiplier: 1.0,
    };
    console.log('[v0] Started new game run:', runId);
  }

  /**
   * End the current run
   */
  endRun(): GameStatistics {
    const endTime = Date.now();
    const stats: GameStatistics = {
      ...this.currentRunStats,
      endTime,
      duration: endTime - (this.currentRunStats.startTime || 0),
    } as GameStatistics;

    console.log('[v0] Game run ended. Final score:', stats.score, 'Wave:', stats.wave);
    return stats;
  }

  /**
   * Record score change
   */
  recordScore(amount: number): void {
    if (this.currentRunStats.score !== undefined) {
      this.currentRunStats.score += amount;
    }
  }

  /**
   * Record kill
   */
  recordKill(damageDealt: number): void {
    if (this.currentRunStats.kills !== undefined) {
      this.currentRunStats.kills += 1;
      if (this.currentRunStats.damageDealt !== undefined) {
        this.currentRunStats.damageDealt += damageDealt;
      }
    }
  }

  /**
   * Record damage taken
   */
  recordDamageTaken(amount: number): void {
    if (this.currentRunStats.damageTaken !== undefined) {
      this.currentRunStats.damageTaken += amount;
    }
  }

  /**
   * Record healing
   */
  recordHealing(amount: number): void {
    if (this.currentRunStats.healingReceived !== undefined) {
      this.currentRunStats.healingReceived += amount;
    }
  }

  /**
   * Record ability cast
   */
  recordAbilityCast(abilityId: string): void {
    if (!this.currentRunStats.abilityCasts) {
      this.currentRunStats.abilityCasts = {};
    }
    this.currentRunStats.abilityCasts[abilityId] =
      (this.currentRunStats.abilityCasts[abilityId] || 0) + 1;
  }

  /**
   * Record upgrade application
   */
  recordUpgrade(upgradeId: string): void {
    if (!this.currentRunStats.upgradesApplied) {
      this.currentRunStats.upgradesApplied = [];
    }
    this.currentRunStats.upgradesApplied.push(upgradeId);
  }

  /**
   * Update wave
   */
  setWave(wave: number): void {
    if (this.currentRunStats.wave !== undefined) {
      this.currentRunStats.wave = wave;
    }
  }

  /**
   * Record combo multiplier
   */
  setComboMultiplier(multiplier: number): void {
    if (this.currentRunStats.finalComboMultiplier !== undefined) {
      this.currentRunStats.finalComboMultiplier = multiplier;
    }
    if (this.currentRunStats.maxCombo !== undefined) {
      this.currentRunStats.maxCombo = Math.max(
        this.currentRunStats.maxCombo,
        multiplier
      );
    }
  }

  /**
   * Record gems collected
   */
  recordGemsCollected(amount: number): void {
    if (this.currentRunStats.gemsCollected !== undefined) {
      this.currentRunStats.gemsCollected += amount;
    }
  }

  /**
   * Get current run statistics
   */
  getCurrentStats(): Partial<GameStatistics> {
    return { ...this.currentRunStats };
  }

  /**
   * Calculate accuracy percentage
   */
  calculateAccuracy(hits: number, totalShots: number): number {
    if (totalShots === 0) return 0;
    const accuracy = (hits / totalShots) * 100;
    if (this.currentRunStats.accuracy !== undefined) {
      this.currentRunStats.accuracy = accuracy;
    }
    return accuracy;
  }

  /**
   * Get detailed statistics report
   */
  getStatisticsReport(): {
    summary: string;
    detailedStats: { [key: string]: any };
  } {
    const stats = this.currentRunStats as GameStatistics;
    const duration = (stats.duration || 0) / 1000; // convert to seconds

    return {
      summary: `Run completed: ${stats.score} points, Wave ${stats.wave}, ${stats.kills} kills`,
      detailedStats: {
        score: stats.score,
        wave: stats.wave,
        kills: stats.kills,
        damageDealt: stats.damageDealt,
        damageTaken: stats.damageTaken,
        durationSeconds: duration.toFixed(2),
        killsPerSecond: (stats.kills / duration).toFixed(2),
        scorePerSecond: (stats.score / duration).toFixed(2),
        accuracy: `${stats.accuracy.toFixed(1)}%`,
        maxCombo: stats.maxCombo,
        finalComboMultiplier: `${stats.finalComboMultiplier.toFixed(2)}x`,
        upgradesCount: stats.upgradesApplied.length,
        gemsCollected: stats.gemsCollected,
      },
    };
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.currentRunStats = {};
    console.log('[v0] Statistics tracker reset');
  }
}

export const statisticsTracker = StatisticsTracker.getInstance();
