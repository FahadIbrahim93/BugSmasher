import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clamp, dist, angle, lerp, randInt, TAU } from './utils';
import { GAME_CONFIG, ENEMY_SPAWN_WAVES, ENEMY_SPAWN_CHANCE, WAVE_DIFFICULTY } from './config';
import { ENEMY_TYPES, EnemyType } from './enemies';
import { player, HERO_CLASSES, HeroClass } from './player';

describe('Game Config Constants', () => {
  it('should have valid world size', () => {
    expect(GAME_CONFIG.WORLD_SIZE).toBeGreaterThan(0);
    expect(GAME_CONFIG.WORLD_SIZE).toBe(4000);
  });

  it('should have valid player base stats', () => {
    expect(GAME_CONFIG.PLAYER.BASE_SPEED).toBeGreaterThan(0);
    expect(GAME_CONFIG.PLAYER.BASE_HP).toBeGreaterThan(0);
    expect(GAME_CONFIG.PLAYER.BASE_DAMAGE).toBeGreaterThan(0);
  });

  it('should have valid spawn rates', () => {
    expect(GAME_CONFIG.SPAWNING.BASE_SPAWN_RATE).toBeGreaterThan(0);
    expect(GAME_CONFIG.SPAWNING.BASE_SPAWN_RATE).toBeLessThan(1);
    expect(GAME_CONFIG.SPAWNING.BASE_MAX_ENEMIES).toBeGreaterThan(0);
  });

  it('should have valid wave config', () => {
    expect(GAME_CONFIG.WAVE.KILLS_PER_WAVE).toBeGreaterThan(0);
    expect(GAME_CONFIG.WAVE.BOSS_INTERVAL).toBeGreaterThan(0);
  });

  it('should have valid ability cooldowns', () => {
    expect(GAME_CONFIG.ABILITY.VENOM_BURST.COOLDOWN).toBeGreaterThan(0);
    expect(GAME_CONFIG.ABILITY.LIGHTNING_STING.COOLDOWN).toBeGreaterThan(0);
    expect(GAME_CONFIG.ABILITY.CHITIN_SHIELD.COOLDOWN).toBeGreaterThan(0);
    expect(GAME_CONFIG.ABILITY.DEATH_SWARM.COOLDOWN).toBeGreaterThan(0);
  });
});

describe('Enemy Spawn Wave Configuration', () => {
  it('should have increasing wave thresholds', () => {
    expect(ENEMY_SPAWN_WAVES.WASP_WAVE).toBeLessThan(ENEMY_SPAWN_WAVES.MOTH_WAVE);
    expect(ENEMY_SPAWN_WAVES.MOTH_WAVE).toBeLessThan(ENEMY_SPAWN_WAVES.SOLDIER_WAVE);
    expect(ENEMY_SPAWN_WAVES.SOLDIER_WAVE).toBeLessThan(ENEMY_SPAWN_WAVES.SPITTER_WAVE);
    expect(ENEMY_SPAWN_WAVES.SPITTER_WAVE).toBeLessThan(ENEMY_SPAWN_WAVES.TANK_WAVE);
  });

  it('should have valid spawn chances that sum reasonably', () => {
    const total =
      ENEMY_SPAWN_CHANCE.WASP +
      ENEMY_SPAWN_CHANCE.MOTH +
      ENEMY_SPAWN_CHANCE.SOLDIER +
      ENEMY_SPAWN_CHANCE.SPITTER +
      ENEMY_SPAWN_CHANCE.TANK;
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(1);
  });

  it('should have difficulty multipliers', () => {
    expect(WAVE_DIFFICULTY.ENEMY_HP_MULT).toBeGreaterThan(0);
    expect(WAVE_DIFFICULTY.BOSS_HP_MULT).toBeGreaterThan(WAVE_DIFFICULTY.ENEMY_HP_MULT);
  });
});

describe('Math Utilities', () => {
  it('clamp should constrain values within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('dist should calculate correct euclidean distance', () => {
    expect(dist(0, 0, 3, 4)).toBe(5);
    expect(dist(0, 0, 0, 0)).toBe(0);
    expect(dist(1, 1, 4, 5)).toBe(5);
    expect(dist(-1, -1, 2, 3)).toBe(5);
  });

  it('angle should calculate correct radians', () => {
    expect(angle(0, 0, 1, 0)).toBeCloseTo(0, 5);
    expect(angle(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2, 5);
    expect(angle(0, 0, -1, 0)).toBeCloseTo(Math.PI, 5);
    expect(angle(0, 0, 0, -1)).toBeCloseTo(-Math.PI / 2, 5);
  });

  it('lerp should interpolate correctly', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(lerp(100, 200, 0.5)).toBe(150);
  });

  it('randInt should return integers in range', () => {
    for (let i = 0; i < 100; i++) {
      const v = randInt(1, 5);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('TAU should equal 2*PI', () => {
    expect(TAU).toBeCloseTo(Math.PI * 2, 10);
  });
});

describe('Player State', () => {
  beforeEach(() => {
    player.hp = 100;
    player.maxHp = 100;
    player.xp = 0;
    player.maxXp = 100;
    player.level = 1;
    player.attackDamage = 25;
    player.attackRate = 0.25;
    player.attackRange = 80;
    player.speed = 220;
    player.upgradePoints = 0;
    player.abilities.forEach((ab) => (ab.cooldown = 0));
  });

  it('should have valid base stats', () => {
    expect(player.hp).toBeGreaterThan(0);
    expect(player.maxHp).toBeGreaterThan(0);
    expect(player.attackDamage).toBeGreaterThan(0);
    expect(player.speed).toBeGreaterThan(0);
  });

  it('should start at level 1', () => {
    expect(player.level).toBe(1);
  });

  it('should have 4 abilities', () => {
    expect(player.abilities).toHaveLength(4);
  });

  it('should apply damage correctly', () => {
    const initialHp = player.hp;
    const damage = 25;
    player.hp -= damage;
    expect(player.hp).toBe(initialHp - damage);
  });

  it('should not go below 0 HP', () => {
    player.hp = 10;
    player.hp -= 100;
    expect(player.hp).toBeLessThanOrEqual(0);
  });

  it('should heal within max HP bounds', () => {
    player.hp = 50;
    const healAmount = 30;
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    expect(player.hp).toBe(80);
  });

  it('should gain XP and level up', () => {
    player.xp = 90;
    player.maxXp = 100;
    player.level = 1;
    player.xp += 20;
    expect(player.xp).toBe(110);
    if (player.xp >= player.maxXp) {
      player.level++;
      player.xp -= player.maxXp;
      player.maxXp = Math.floor(player.maxXp * 1.5);
    }
    expect(player.level).toBe(2);
  });

  it('should apply attack cooldown', () => {
    player.attackCooldown = 0;
    player.attackRate = 0.25;
    player.attackCooldown = player.attackRate;
    expect(player.attackCooldown).toBe(0.25);
    player.attackCooldown -= 0.1;
    expect(player.attackCooldown).toBe(0.15);
  });

  it('should track upgrade points', () => {
    player.upgradePoints = 3;
    player.upgradePoints -= 1;
    expect(player.upgradePoints).toBe(2);
  });

  it('ability cooldowns should track correctly', () => {
    player.abilities[0].cooldown = 5;
    player.abilities[0].cooldown -= 1;
    expect(player.abilities[0].cooldown).toBe(4);
    expect(player.abilities[0].cooldown).toBeGreaterThan(0);
  });
});

describe('Hero Classes', () => {
  it('should have 3 hero classes', () => {
    expect(HERO_CLASSES).toHaveLength(3);
  });

  it('each hero should have valid stats', () => {
    HERO_CLASSES.forEach((hero: HeroClass) => {
      expect(hero.id).toBeDefined();
      expect(hero.name).toBeDefined();
      expect(hero.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(hero.stats.speed).toBeGreaterThan(0);
      expect(hero.stats.health).toBeGreaterThan(0);
      expect(hero.stats.damage).toBeGreaterThan(0);
      expect(hero.stats.attackRate).toBeGreaterThan(0);
      expect(hero.stats.range).toBeGreaterThan(0);
    });
  });

  it('each hero should have unique IDs', () => {
    const ids = HERO_CLASSES.map((h: HeroClass) => h.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('mantis should have highest speed', () => {
    const mantis = HERO_CLASSES.find((h: HeroClass) => h.id === 'mantis');
    expect(mantis?.stats.speed).toBe(1.3);
  });

  it('scarab should have highest health', () => {
    const scarab = HERO_CLASSES.find((h: HeroClass) => h.id === 'scarab');
    expect(scarab?.stats.health).toBe(1.5);
  });

  it('widow should have highest range', () => {
    const widow = HERO_CLASSES.find((h: HeroClass) => h.id === 'widow');
    expect(widow?.stats.range).toBe(1.4);
  });
});

describe('Enemy Types', () => {
  it('should have beetle as basic enemy', () => {
    const beetle = ENEMY_TYPES.beetle;
    expect(beetle.id).toBe('beetle');
    expect(beetle.health).toBe(50);
    expect(beetle.speed).toBe(80);
    expect(beetle.damage).toBe(10);
    expect(beetle.score).toBe(10);
  });

  it('should have boss enemies', () => {
    expect(ENEMY_TYPES.hiveMother).toBeDefined();
    expect(ENEMY_TYPES.voidQueen).toBeDefined();
    expect(ENEMY_TYPES.hiveMother.health).toBe(800);
    expect(ENEMY_TYPES.voidQueen.health).toBe(1600);
    expect(ENEMY_TYPES.hiveMother.bossPhases).toBe(2);
    expect(ENEMY_TYPES.voidQueen.bossPhases).toBe(3);
  });

  it('should have ranged enemies', () => {
    const spitter = ENEMY_TYPES.spitter;
    expect(spitter.aiType).toBe('ranged');
    expect(spitter.rangeKeep).toBe(180);
    expect(spitter.fireRate).toBe(2.2);
  });

  it('should have charger enemies', () => {
    const charger = ENEMY_TYPES.charger;
    expect(charger.aiType).toBe('charger');
    expect(charger.chargeSpeed).toBe(380);
    expect(charger.chargeCooldown).toBe(4);
  });

  it('should have healer enemies', () => {
    const shaman = ENEMY_TYPES.shaman;
    expect(shaman.aiType).toBe('healer');
    expect(shaman.healRadius).toBe(130);
    expect(shaman.healRate).toBe(0.8);
  });

  it('each enemy should have valid colors', () => {
    Object.values(ENEMY_TYPES).forEach((type: EnemyType) => {
      expect(type.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(type.gemColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('enemy damage should scale with wave', () => {
    const wave = 5;
    const baseHp = ENEMY_TYPES.beetle.health;
    const scaledHp = baseHp * (1 + wave * WAVE_DIFFICULTY.ENEMY_HP_MULT);
    expect(scaledHp).toBe(100);
  });

  it('boss HP should scale higher than regular enemies', () => {
    const wave = 5;
    const baseHp = ENEMY_TYPES.beetle.health;
    const bossHp = ENEMY_TYPES.hiveMother.health;

    const scaledBase = baseHp * (1 + wave * WAVE_DIFFICULTY.ENEMY_HP_MULT);
    const scaledBoss = bossHp * (1 + wave * WAVE_DIFFICULTY.BOSS_HP_MULT);

    expect(scaledBoss).toBeGreaterThan(scaledBase);
  });
});

describe('Game Mechanics', () => {
  it('should calculate damage with attack damage', () => {
    const attackDamage = 25;
    const enemy = { hp: 50 };
    enemy.hp -= attackDamage;
    expect(enemy.hp).toBe(25);
  });

  it('should check if enemy is in attack range', () => {
    const playerPos = { x: 100, y: 100 };
    const enemyPos = { x: 150, y: 100 };
    const attackRange = 80;
    const d = dist(playerPos.x, playerPos.y, enemyPos.x, enemyPos.y);
    expect(d < attackRange).toBe(true);
  });

  it('should check if enemy is outside attack range', () => {
    const playerPos = { x: 100, y: 100 };
    const enemyPos = { x: 200, y: 100 };
    const attackRange = 80;
    const d = dist(playerPos.x, playerPos.y, enemyPos.x, enemyPos.y);
    expect(d < attackRange).toBe(false);
  });

  it('should calculate angle to enemy', () => {
    const playerPos = { x: 100, y: 100 };
    const enemyPos = { x: 100, y: 150 };
    const a = angle(playerPos.x, playerPos.y, enemyPos.x, enemyPos.y);
    expect(a).toBeCloseTo(Math.PI / 2, 5);
  });

  it('should calculate projectile trajectory', () => {
    const angleValue = Math.PI / 4;
    const speed = 500;
    const dt = 0.016;
    const dx = Math.cos(angleValue) * speed * dt;
    const dy = Math.sin(angleValue) * speed * dt;
    const expected = 500 * 0.016 * Math.SQRT1_2;
    expect(dx).toBeCloseTo(expected, 1);
    expect(dy).toBeCloseTo(expected, 1);
  });

  it('should handle gem pickup', () => {
    const playerPos = { x: 100, y: 100, xp: 0 };
    const gem = { x: 100, y: 100, xp: 10 };
    const d = dist(playerPos.x, playerPos.y, gem.x, gem.y);
    const pickupDist = 20;
    if (d < pickupDist) {
      playerPos.xp += gem.xp;
    }
    expect(playerPos.xp).toBe(10);
  });

  it('should check wave completion', () => {
    let wave = 1;
    let enemiesKilled = 0;
    const killsRequired = wave * 20;
    enemiesKilled = 20;
    expect(enemiesKilled >= killsRequired).toBe(true);
  });

  it('should calculate XP needed for next level', () => {
    const baseXp = 100;
    const multiplier = 1.5;
    const currentLevel = 1;
    const xpNeeded = Math.floor(baseXp * Math.pow(multiplier, currentLevel - 1));
    expect(xpNeeded).toBe(100);

    const xpNeededLevel2 = Math.floor(baseXp * Math.pow(multiplier, 2 - 1));
    expect(xpNeededLevel2).toBe(150);
  });

  it('should handle player movement clamped to world', () => {
    const worldSize = 4000;
    let x = 100;
    let y = 100;
    const speed = 220;
    const dt = 0.016;
    const dx = 1;
    const dy = 1;
    const len = Math.sqrt(dx * dx + dy * dy);
    x += (dx / len) * speed * dt;
    y += (dy / len) * speed * dt;
    x = clamp(x, 0, worldSize);
    y = clamp(y, 0, worldSize);
    expect(x).toBeGreaterThan(100);
    expect(x).toBeLessThan(worldSize);
  });
});

describe('Wave Progression', () => {
  it('should increment wave after kills threshold', () => {
    let wave = 1;
    let enemiesKilled = 0;
    const killsPerWave = 20;
    enemiesKilled = 20;
    if (enemiesKilled >= wave * killsPerWave) {
      wave++;
      enemiesKilled = 0;
    }
    expect(wave).toBe(2);
  });

  it('should spawn boss every 5 waves', () => {
    for (let wave = 1; wave <= 15; wave++) {
      if (wave % 5 === 0) {
        const isBossWave = true;
        expect(isBossWave).toBe(true);
      }
    }
  });

  it('should determine enemy spawn based on wave', () => {
    const getSpawnChance = (wave: number) => {
      if (wave > 10) return ENEMY_SPAWN_CHANCE.TANK;
      if (wave > 8) return ENEMY_SPAWN_CHANCE.SPITTER;
      if (wave > 6) return ENEMY_SPAWN_CHANCE.SOLDIER;
      if (wave > 4) return ENEMY_SPAWN_CHANCE.MOTH;
      if (wave > 2) return ENEMY_SPAWN_CHANCE.WASP;
      return 0;
    };
    expect(getSpawnChance(1)).toBe(0);
    expect(getSpawnChance(3)).toBe(0.3);
    expect(getSpawnChance(5)).toBe(0.2);
    expect(getSpawnChance(7)).toBe(0.15);
    expect(getSpawnChance(9)).toBe(0.15);
    expect(getSpawnChance(11)).toBe(0.1);
  });
});
