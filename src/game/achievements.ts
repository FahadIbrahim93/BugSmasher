/**
 * Advanced Achievement System for BugSmasher
 * Tracks multiple categories of achievements with dynamic progression
 */

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: 'score' | 'wave' | 'kills' | 'time' | 'class' | 'special';
  requirement: number | string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  reward?: {
    points: number;
  };
}

export interface AchievementProgress {
  id: string;
  unlockedAt?: number;
  progress?: number; // 0-100 for tracking partial progress
}

class AchievementManager {
  private static instance: AchievementManager;
  private achievements: Map<string, AchievementDefinition> = new Map();
  private unlockedAchievements: Set<string> = new Set();

  private constructor() {
    this.initializeAchievements();
  }

  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  /**
   * Initialize all available achievements
   */
  private initializeAchievements() {
    const defs: AchievementDefinition[] = [
      // Score-based achievements
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Score your first 1,000 points',
        category: 'score',
        requirement: 1000,
        rarity: 'common',
        icon: '🩸',
        reward: { points: 10 },
      },
      {
        id: 'swarm_slayer',
        name: 'Swarm Slayer',
        description: 'Score 10,000 points in a single run',
        category: 'score',
        requirement: 10000,
        rarity: 'uncommon',
        icon: '⚔️',
        reward: { points: 50 },
      },
      {
        id: 'bug_apocalypse',
        name: 'Bug Apocalypse',
        description: 'Score 100,000 points in a single run',
        category: 'score',
        requirement: 100000,
        rarity: 'epic',
        icon: '💥',
        reward: { points: 200 },
      },

      // Wave-based achievements
      {
        id: 'wave_rider',
        name: 'Wave Rider',
        description: 'Survive to wave 5',
        category: 'wave',
        requirement: 5,
        rarity: 'common',
        icon: '🌊',
        reward: { points: 15 },
      },
      {
        id: 'apex_predator',
        name: 'Apex Predator',
        description: 'Reach wave 10',
        category: 'wave',
        requirement: 10,
        rarity: 'rare',
        icon: '👑',
        reward: { points: 100 },
      },
      {
        id: 'eternal_swarm',
        name: 'Eternal Swarm',
        description: 'Reach wave 20',
        category: 'wave',
        requirement: 20,
        rarity: 'legendary',
        icon: '♾️',
        reward: { points: 500 },
      },

      // Kill-based achievements
      {
        id: 'insect_hunter',
        name: 'Insect Hunter',
        description: 'Kill 100 insects total',
        category: 'kills',
        requirement: 100,
        rarity: 'common',
        icon: '🎯',
        reward: { points: 20 },
      },
      {
        id: 'genocide',
        name: 'Genocide',
        description: 'Kill 1,000 insects total',
        category: 'kills',
        requirement: 1000,
        rarity: 'epic',
        icon: '☠️',
        reward: { points: 150 },
      },
      {
        id: 'extinction_event',
        name: 'Extinction Event',
        description: 'Kill 10,000 insects total',
        category: 'kills',
        requirement: 10000,
        rarity: 'legendary',
        icon: '🌑',
        reward: { points: 500 },
      },

      // Class-based achievements
      {
        id: 'warrior_master',
        name: 'Warrior Master',
        description: 'Reach wave 10 as a Warrior',
        category: 'class',
        requirement: 'Warrior_wave_10',
        rarity: 'rare',
        icon: '⚔️',
        reward: { points: 75 },
      },
      {
        id: 'rogue_legend',
        name: 'Rogue Legend',
        description: 'Reach wave 10 as a Rogue',
        category: 'class',
        requirement: 'Rogue_wave_10',
        rarity: 'rare',
        icon: '🗡️',
        reward: { points: 75 },
      },
      {
        id: 'ranger_elite',
        name: 'Ranger Elite',
        description: 'Reach wave 10 as a Ranger',
        category: 'class',
        requirement: 'Ranger_wave_10',
        rarity: 'rare',
        icon: '🏹',
        reward: { points: 75 },
      },
      {
        id: 'mage_ascended',
        name: 'Mage Ascended',
        description: 'Reach wave 10 as a Mage',
        category: 'class',
        requirement: 'Mage_wave_10',
        rarity: 'rare',
        icon: '🔮',
        reward: { points: 75 },
      },

      // Special achievements
      {
        id: 'speedrunner',
        name: 'Speedrunner',
        description: 'Complete 5 runs in one session',
        category: 'special',
        requirement: 'speedrunner_5_runs',
        rarity: 'uncommon',
        icon: '⚡',
        reward: { points: 50 },
      },
      {
        id: 'comeback_king',
        name: 'Comeback King',
        description: 'Survive with less than 10% HP remaining',
        category: 'special',
        requirement: 'hp_less_than_10',
        rarity: 'rare',
        icon: '💪',
        reward: { points: 80 },
      },
    ];

    defs.forEach(def => {
      this.achievements.set(def.id, def);
    });

    console.log('[v0] Initialized', defs.length, 'achievements');
  }

  /**
   * Check if achievement should be unlocked based on game stats
   */
  checkAchievementUnlock(
    score: number,
    wave: number,
    kills: number,
    heroClass: string,
    hp: number,
    maxHp: number,
    totalRuns: number
  ): string[] {
    const newlyUnlocked: string[] = [];

    for (const [id, achievement] of this.achievements) {
      if (this.unlockedAchievements.has(id)) continue;

      let shouldUnlock = false;

      switch (achievement.category) {
        case 'score':
          shouldUnlock = score >= (achievement.requirement as number);
          break;
        case 'wave':
          shouldUnlock = wave >= (achievement.requirement as number);
          break;
        case 'kills':
          shouldUnlock = kills >= (achievement.requirement as number);
          break;
        case 'class':
          shouldUnlock = (achievement.requirement as string).startsWith(
            `${heroClass}_wave_${wave}`
          );
          break;
        case 'time':
          // Time-based achievements would be tracked separately
          break;
        case 'special':
          if (achievement.requirement === 'hp_less_than_10') {
            shouldUnlock = hp < maxHp * 0.1 && hp > 0;
          }
          break;
      }

      if (shouldUnlock) {
        this.unlockedAchievements.add(id);
        newlyUnlocked.push(id);
        console.log('[v0] Achievement unlocked:', achievement.name);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get achievement by ID
   */
  getAchievement(id: string): AchievementDefinition | undefined {
    return this.achievements.get(id);
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): AchievementDefinition[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): AchievementDefinition[] {
    return Array.from(this.unlockedAchievements)
      .map(id => this.achievements.get(id))
      .filter((a): a is AchievementDefinition => a !== undefined);
  }

  /**
   * Check if achievement is unlocked
   */
  isUnlocked(id: string): boolean {
    return this.unlockedAchievements.has(id);
  }

  /**
   * Load unlocked achievements from a set of IDs
   */
  loadUnlockedAchievements(ids: string[]): void {
    this.unlockedAchievements.clear();
    ids.forEach(id => {
      if (this.achievements.has(id)) {
        this.unlockedAchievements.add(id);
      }
    });
    console.log('[v0] Loaded', this.unlockedAchievements.size, 'unlocked achievements');
  }

  /**
   * Get achievement progress percentage
   */
  getAchievementProgress(id: string): number {
    const achievement = this.achievements.get(id);
    if (!achievement) return 0;
    return this.isUnlocked(id) ? 100 : 0;
  }
}

export const achievementManager = AchievementManager.getInstance();
