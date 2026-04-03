import {
  initAudio,
  sfxAttack,
  sfxKill,
  sfxHit,
  sfxAbility,
  sfxGemPickup,
  sfxLevelUp,
  sfxUpgrade,
  sfxSynergy,
} from './audio';
import { player, HeroClass, HERO_CLASSES } from './player';
import { enemies, ENEMY_TYPES, setEnemies, Enemy } from './enemies';
import { particles, spawnParticles } from './particles';
import { InsectRenderer } from './renderer';
import { UPGRADE_DEFS, RARITY, SYNERGY_DEFS, SynergyDef, UpgradeDef, RarityKey } from './upgrades';
import {
  WORLD_SIZE,
  TAU,
  lerp,
  clamp,
  dist,
  distSq,
  angle,
  rand,
  randInt,
  hsl,
  rgb,
  ACHIEVEMENT_DEFS,
  RunStats,
  Log,
} from './utils';

type Projectile = {
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
  life: number;
  size: number;
  color: string;
  pierce?: boolean;
  isEnemy?: boolean;
};

type Gem = {
  x: number;
  y: number;
  xp: number;
  color: string;
  magnetized: boolean;
};

type DamageNumber = {
  x: number;
  y: number;
  val: number;
  life: number;
  color: string;
  isCrit: boolean;
};

type AchievementToast = {
  id: string;
  name: string;
  icon: string;
  life: number;
};

type SynergyToast = {
  id: string;
  name: string;
  icon: string;
  tier: string;
  desc: string;
  life: number;
};

let projectiles: Projectile[] = [];
let gems: Gem[] = [];
let damageNumbers: DamageNumber[] = [];
let achievementToasts: AchievementToast[] = [];
let synergyToasts: SynergyToast[] = [];

let isPlaying = false;
let gameTime = 0;
let lastTime = 0;
let score = 0;
let wave = 1;
let enemiesKilledThisWave = 0;
let totalKills = 0;
let combo = 0;
let comboTimer = 0;
let maxCombo = 0;
let fps = 0;
let frameCount = 0;
let fpsTimer = 0;

let playerUpgrades: Record<string, number> = {};
let activeSynergies: Set<string> = new Set();
let discoveredSynergies: Set<string> = new Set();
let upgradePoints = 0;
let rerollCost = 50;

let runStats: RunStats = {
  totalKills: 0,
  maxWave: 0,
  bestScore: 0,
  maxCombo: 0,
  maxLevel: 0,
  synergiesActivated: 0,
  bossesKilled: 0,
  dailyCompleted: false,
  timePlayed: 0,
};

let ctx: CanvasRenderingContext2D | null = null;
let minimapCtx: CanvasRenderingContext2D | null = null;
let canvasWidth = 0;
let canvasHeight = 0;

const keys: Record<string, boolean> = {};
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

let onGameOver: (score: number, wave: number) => void;
let onScoreUpdate: (score: number) => void;
let onLevelUp: () => void;
let onWaveUpdate: (wave: number) => void;
let onAchievementUnlock: (id: string) => void;
let onSynergyActivate: (id: string) => void;
let onStatsUpdate: (stats: RunStats) => void;

export function getPlayerState() {
  return {
    hp: player.hp,
    maxHp: player.maxHp,
    xp: player.xp,
    maxXp: player.maxXp,
    level: player.level,
    upgradePoints,
    combo,
    maxCombo,
    abilities: [...player.abilities],
    score,
    wave,
    totalKills,
    fps,
    activeSynergies: Array.from(activeSynergies),
    discoveredSynergies: Array.from(discoveredSynergies),
    playerUpgrades: { ...playerUpgrades },
  };
}

export function getRunStats(): RunStats {
  return { ...runStats };
}

export function getUpgradeState() {
  return {
    upgradePoints,
    activeSynergies: Array.from(activeSynergies),
    discoveredSynergies: Array.from(discoveredSynergies),
    playerUpgrades: { ...playerUpgrades },
    rerollCost,
  };
}

export function getAvailableUpgrades(): { upgrade: UpgradeDef; level: number; cost: number }[] {
  const available: { upgrade: UpgradeDef; level: number; cost: number }[] = [];
  for (const upg of UPGRADE_DEFS) {
    const level = playerUpgrades[upg.id] || 0;
    if (level < upg.maxLevel) {
      const cost = upg.costs[level] ?? upg.costs[upg.costs.length - 1];
      available.push({ upgrade: upg, level, cost });
    }
  }
  return available.sort(() => 0.5 - Math.random()).slice(0, 3);
}

export function initGame(
  canvas: HTMLCanvasElement,
  minimap: HTMLCanvasElement,
  onGameOverCb: (score: number, wave: number) => void,
  onScoreUpdateCb: (score: number) => void,
  onLevelUpCb: () => void,
  onWaveUpdateCb: (wave: number) => void,
  onAchievementUnlockCb?: (id: string) => void,
  onSynergyActivateCb?: (id: string) => void,
  onStatsUpdateCb?: (stats: RunStats) => void
) {
  ctx = canvas.getContext('2d');
  minimapCtx = minimap.getContext('2d');
  onGameOver = onGameOverCb;
  onScoreUpdate = onScoreUpdateCb;
  onLevelUp = onLevelUpCb;
  onWaveUpdate = onWaveUpdateCb;
  onAchievementUnlock = onAchievementUnlockCb ?? (() => {});
  onSynergyActivate = onSynergyActivateCb ?? (() => {});
  onStatsUpdate = onStatsUpdateCb ?? (() => {});

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
  };
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (['q', 'w', 'e', 'r', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));
  canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  canvas.addEventListener('mousedown', () => (isMouseDown = true));
  canvas.addEventListener('mouseup', () => (isMouseDown = false));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  requestAnimationFrame(gameLoop);
}

export function startGame(heroClass: HeroClass) {
  isPlaying = true;
  gameTime = 0;
  score = 0;
  wave = 1;
  enemiesKilledThisWave = 0;
  totalKills = 0;
  combo = 0;
  comboTimer = 0;
  maxCombo = 0;
  upgradePoints = 0;
  rerollCost = 50;
  playerUpgrades = {};
  activeSynergies = new Set();
  discoveredSynergies = new Set();
  projectiles = [];
  gems = [];
  damageNumbers = [];
  achievementToasts = [];
  synergyToasts = [];

  runStats = {
    totalKills: 0,
    maxWave: 0,
    bestScore: 0,
    maxCombo: 0,
    maxLevel: 0,
    synergiesActivated: 0,
    bossesKilled: 0,
    dailyCompleted: false,
    timePlayed: 0,
  };

  player.x = WORLD_SIZE / 2;
  player.y = WORLD_SIZE / 2;
  player.vx = 0;
  player.vy = 0;
  player.hp = heroClass.stats.health * 100;
  player.maxHp = heroClass.stats.health * 100;
  player.health = player.hp;
  player.maxHealth = player.maxHp;
  player.heroClass = heroClass;
  player.attackDamage = heroClass.stats.damage * 25;
  player.attackRate = heroClass.stats.attackRate * 0.25;
  player.baseAttackRate = player.attackRate;
  player.attackRange = heroClass.stats.range * 80;
  player.speed = heroClass.stats.speed * 220;
  player.baseSpeed = player.speed;
  player.baseDamage = player.attackDamage;
  player.baseMaxHealth = player.maxHp;
  player.xp = 0;
  player.maxXp = 100;
  player.level = 1;
  player.attackCooldown = 0;
  player.combo = 0;
  player.comboTimer = 0;
  player.maxCombo = 0;
  player.invincible = 0;
  player.shieldActive = false;
  player.shieldTimer = 0;
  player.usedSecondWind = false;
  player.juggernautDR = 0;
  player.venomLordActive = false;
  player.ironHideActive = false;
  player.bladeStormActive = false;
  player.undyingActive = false;
  player.shieldBonusDuration = 0;
  player.upgrades = {};
  player.lifeSteal = 0;
  player.critChance = 0;
  player.thornsDamage = 0;
  player.multiStrike = 0;
  player.comboTimeBonus = 0;
  player.abilityCooldownReduction = 0;

  initAudio();
  onScoreUpdate(0);
  onWaveUpdate(1);
}

export function resumeGame() {
  isPlaying = true;
}

export function purchaseUpgrade(upgradeId: string): boolean {
  const upgrade = UPGRADE_DEFS.find((u) => u.id === upgradeId);
  if (!upgrade) return false;
  const level = playerUpgrades[upgradeId] || 0;
  if (level >= upgrade.maxLevel) return false;
  const cost = upgrade.costs[level] ?? upgrade.costs[upgrade.costs.length - 1];
  if (upgradePoints < cost) return false;
  upgradePoints -= cost;
  playerUpgrades[upgradeId] = level + 1;
  applyUpgrade(upgrade, level + 1);
  checkSynergies();
  sfxUpgrade();
  return true;
}

function applyUpgrade(upgrade: UpgradeDef, level: number) {
  const value = upgrade.value * level;
  const rarityMult = RARITY[upgrade.rarity as RarityKey]?.effectMult ?? 1;
  const effectiveValue = value * rarityMult;

  switch (upgrade.id) {
    case 'rate_1':
      player.attackRate = player.baseAttackRate * Math.pow(1 - effectiveValue, level);
      break;
    case 'spd_1':
      player.speed = player.baseSpeed + effectiveValue * level;
      break;
    case 'hp_1':
      player.maxHp += effectiveValue * level;
      player.hp += effectiveValue * level;
      player.baseMaxHealth = player.maxHp;
      break;
    case 'dmg_1':
      player.attackDamage = player.baseDamage + effectiveValue * level;
      break;
    case 'cooldown_1':
      player.abilityCooldownReduction = effectiveValue;
      for (const ab of player.abilities) {
        ab.maxCooldown = ab.baseCooldown * (1 - player.abilityCooldownReduction);
      }
      break;
    case 'heal_1':
      player.hp = Math.min(player.maxHp, player.hp + effectiveValue);
      break;
    case 'comboTime_1':
      player.comboTimeBonus = effectiveValue;
      break;
    case 'range_1':
      player.attackRange += effectiveValue * level;
      break;
    case 'lifeSteal_1':
      player.lifeSteal = effectiveValue;
      break;
    case 'critChance_1':
      player.critChance = effectiveValue;
      break;
    case 'thorns_1':
      player.thornsDamage = effectiveValue;
      break;
    case 'multiStrike_1':
      player.multiStrike = level;
      break;
    case 'secondWind_1':
      player.usedSecondWind = false;
      break;
  }
}

function checkSynergies() {
  const counts: Record<string, number> = {};
  for (const [id, level] of Object.entries(playerUpgrades)) {
    if (id.startsWith('dmg_')) counts.damage = (counts.damage || 0) + level;
    if (id.startsWith('spd_')) counts.movSpeed = (counts.movSpeed || 0) + level;
    if (id.startsWith('hp_')) counts.maxHp = (counts.maxHp || 0) + level;
    if (id.startsWith('rate_')) counts.atkSpeed = (counts.atkSpeed || 0) + level;
    if (id.startsWith('range_')) counts.range = (counts.range || 0) + level;
    if (id.startsWith('heal_')) counts.regen = (counts.regen || 0) + level;
    if (id.startsWith('cooldown_')) counts.cooldown = (counts.cooldown || 0) + level;
    if (id.startsWith('comboTime_')) counts.comboTime = (counts.comboTime || 0) + level;
    if (id.startsWith('lifeSteal_')) counts.lifeSteal = (counts.lifeSteal || 0) + level;
    if (id.startsWith('critChance_')) counts.critChance = (counts.critChance || 0) + level;
    if (id.startsWith('thorns_')) counts.thorns = (counts.thorns || 0) + level;
    if (id.startsWith('multiStrike_')) counts.multiStrike = (counts.multiStrike || 0) + level;
    if (id.startsWith('secondWind_')) counts.secondWind = (counts.secondWind || 0) + level;
  }

  for (const syn of SYNERGY_DEFS) {
    const isMet = Object.entries(syn.requires).every(
      ([key, required]) => (counts[key] || 0) >= required
    );
    if (isMet && !activeSynergies.has(syn.id)) {
      activeSynergies.add(syn.id);
      discoveredSynergies.add(syn.id);
      applySynergy(syn);
      runStats.synergiesActivated++;
      onSynergyActivate(syn.id);
      sfxSynergy();
      synergyToasts.push({
        id: syn.id,
        name: syn.name,
        icon: syn.icon,
        tier: syn.tier,
        desc: syn.desc,
        life: 3,
      });
      onStatsUpdate(runStats);
    }
  }
}

function applySynergy(syn: SynergyDef) {
  switch (syn.id) {
    case 'berserker':
      player.attackRate *= 0.8;
      player.attackDamage *= 1.15;
      break;
    case 'juggernaut':
      player.maxHp += 30;
      player.hp += 30;
      player.juggernautDR = 0.1;
      break;
    case 'phantom':
      player.speed *= 1.25;
      player.comboTimeBonus += 1;
      break;
    case 'venomLord':
      player.venomLordActive = true;
      player.attackDamage *= 1.2;
      break;
    case 'ironHide':
      player.ironHideActive = true;
      player.thornsDamage *= 1.5;
      player.shieldBonusDuration = 2;
      break;
    case 'bladeStorm':
      player.bladeStormActive = true;
      player.multiStrike = Math.max(player.multiStrike, 2);
      player.critChance += 0.2;
      break;
    case 'apex':
      player.attackDamage *= 1.1;
      player.maxHp *= 1.1;
      player.hp *= 1.1;
      player.speed *= 1.1;
      player.abilityCooldownReduction += 0.2;
      for (const ab of player.abilities) {
        ab.maxCooldown = ab.baseCooldown * (1 - player.abilityCooldownReduction);
      }
      break;
    case 'undying':
      player.undyingActive = true;
      break;
  }
}

function checkAchievements() {
  for (const ach of ACHIEVEMENT_DEFS) {
    if (ach.check(runStats)) {
      onAchievementUnlock(ach.id);
      achievementToasts.push({
        id: ach.id,
        name: ach.name,
        icon: ach.icon,
        life: 3,
      });
    }
  }
}

let isAutoAttack = false;

export function setAutoAttack(val: boolean) {
  isAutoAttack = val;
}

function gameLoop(timestamp: number) {
  if (!lastTime) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  dt = Math.min(dt, 0.05);

  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 1) {
    fps = frameCount;
    frameCount = 0;
    fpsTimer = 0;
  }

  if (isPlaying && ctx) {
    update(dt);
    draw(ctx);
  }

  requestAnimationFrame(gameLoop);
}

function update(dt: number) {
  gameTime += dt;
  runStats.timePlayed += dt;

  updatePlayer(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateGems(dt);
  updateParticles(dt);
  updateDamageNumbers(dt);
  updateToasts(dt);
  updateCombo(dt);
  updateInvincibility(dt);
  updateShield(dt);
  spawnEnemies(dt);
  updateWaveProgression();
  checkAchievements();
}

function updatePlayer(dt: number) {
  let dx = 0;
  let dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * player.speed * dt;
    player.y += (dy / len) * player.speed * dt;
    player.x = clamp(player.x, 0, WORLD_SIZE);
    player.y = clamp(player.y, 0, WORLD_SIZE);
  }

  player.animPhase += dt;
  player.attackCooldown -= dt;

  if ((isMouseDown || isAutoAttack) && player.attackCooldown <= 0) {
    playerAttack();
  }

  if (keys['q'] && player.abilities[0]?.cooldown <= 0) {
    useAbility(0);
    keys['q'] = false;
  }
  if (keys['e'] && player.abilities[2]?.cooldown <= 0) {
    useAbility(2);
    keys['e'] = false;
  }
  if (keys['r'] && player.abilities[3]?.cooldown <= 0) {
    useAbility(3);
    keys['r'] = false;
  }
}

function playerAttack() {
  player.attackCooldown = player.attackRate;
  let targetAngle = angle(
    player.x,
    player.y,
    mouseX + player.x - canvasWidth / 2,
    mouseY + player.y - canvasHeight / 2
  );

  if (isAutoAttack && enemies.length > 0) {
    let closest = enemies[0];
    let closestDist = distSq(player.x, player.y, closest.x, closest.y);
    for (let i = 1; i < enemies.length; i++) {
      const d = distSq(player.x, player.y, enemies[i].x, enemies[i].y);
      if (d < closestDist) {
        closestDist = d;
        closest = enemies[i];
      }
    }
    targetAngle = angle(player.x, player.y, closest.x, closest.y);
  }

  sfxAttack();
  const isRanged = player.heroClass?.id === 'wasp' || player.heroClass?.id === 'moth';

  if (isRanged) {
    const projCount = 1 + player.multiStrike;
    for (let i = 0; i < projCount; i++) {
      const spread = projCount > 1 ? (i - (projCount - 1) / 2) * 0.15 : 0;
      projectiles.push({
        x: player.x,
        y: player.y,
        angle: targetAngle + spread,
        speed: 500,
        damage: calculateDamage(),
        life: 2,
        size: 4,
        color: player.heroClass.color,
        pierce: false,
        isEnemy: false,
      });
    }
    spawnParticles(
      player.x + Math.cos(targetAngle) * 20,
      player.y + Math.sin(targetAngle) * 20,
      5,
      {
        color: player.heroClass.color,
        speed: 2,
        life: 0.2,
      }
    );
  } else {
    const angleToTarget = targetAngle;
    const coneAngle = Math.PI / 4;
    const targets = enemies.filter((e) => {
      const d = dist(player.x, player.y, e.x, e.y);
      if (d > player.attackRange) return false;
      const angleToEnemy = angle(player.x, player.y, e.x, e.y);
      let angleDiff = Math.abs(angleToTarget - angleToEnemy);
      if (angleDiff > Math.PI) angleDiff = TAU - angleDiff;
      return angleDiff < coneAngle;
    });

    for (const e of targets) {
      const dmg = calculateDamage();
      e.hp -= dmg;
      sfxHit();
      spawnParticles(e.x, e.y, 10, { color: e.type.color, speed: 3 });
      damageNumbers.push({
        x: e.x,
        y: e.y,
        val: Math.floor(dmg),
        life: 1,
        color: '#fff',
        isCrit: false,
      });

      if (player.lifeSteal > 0) {
        player.hp = Math.min(player.maxHp, player.hp + dmg * player.lifeSteal);
      }

      if (e.hp <= 0) {
        onEnemyKilled(e);
      }
    }

    if (targets.length > 0) {
      spawnParticles(
        player.x + Math.cos(angleToTarget) * 20,
        player.y + Math.sin(angleToTarget) * 20,
        5,
        { color: '#fff', speed: 2, life: 0.2 }
      );
    }
  }
}

function calculateDamage(): number {
  let dmg = player.attackDamage;
  const isCrit = Math.random() < player.critChance;
  if (isCrit) dmg *= 2;
  return dmg;
}

function useAbility(index: number) {
  const ab = player.abilities[index];
  if (!ab || ab.cooldown > 0) return;

  ab.cooldown = ab.maxCooldown;
  sfxAbility();

  switch (index) {
    case 0: {
      const radius = player.heroClass?.id === 'widow' ? 150 : 120;
      const dmg =
        player.heroClass?.id === 'widow'
          ? 50 * (player.venomLordActive ? 2 : 1)
          : 40 + player.level * 5;
      const color = player.heroClass?.id === 'widow' ? '#0f0' : (player.heroClass?.color ?? '#0f0');
      spawnParticles(player.x, player.y, 30, {
        color,
        speed: player.heroClass?.id === 'widow' ? 5 : 4,
        life: 1,
      });
      for (const e of [...enemies]) {
        if (dist(player.x, player.y, e.x, e.y) < radius) {
          e.hp -= dmg;
          damageNumbers.push({
            x: e.x,
            y: e.y,
            val: Math.floor(dmg),
            life: 1,
            color,
            isCrit: false,
          });
          if (e.hp <= 0) onEnemyKilled(e);
        }
      }
      break;
    }
    case 1: {
      const range = player.heroClass?.id === 'mantis' ? 300 : 250;
      const dmg =
        player.heroClass?.id === 'mantis' ? 100 + player.level * 10 : 60 + player.level * 8;
      spawnParticles(player.x, player.y, 20, { color: '#ff0', speed: 8, life: 0.5 });
      if (enemies.length > 0) {
        let closest = enemies[0];
        let closestDist = distSq(player.x, player.y, closest.x, closest.y);
        for (let i = 1; i < enemies.length; i++) {
          const d = distSq(player.x, player.y, enemies[i].x, enemies[i].y);
          if (d < closestDist) {
            closestDist = d;
            closest = enemies[i];
          }
        }
        if (dist(player.x, player.y, closest.x, closest.y) < range) {
          closest.hp -= dmg;
          damageNumbers.push({
            x: closest.x,
            y: closest.y,
            val: Math.floor(dmg),
            life: 1,
            color: '#ff0',
            isCrit: true,
          });
          if (closest.hp <= 0) onEnemyKilled(closest);
        }
      }
      break;
    }
    case 2: {
      if (player.heroClass?.id === 'scarab') {
        const heal = 50 + player.level * 5;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        spawnParticles(player.x, player.y, 20, { color: '#888', speed: 2, life: 1, shape: 'ring' });
      } else {
        const heal = 30 + player.level * 3;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        player.shieldActive = true;
        player.shieldTimer = 3 + player.shieldBonusDuration;
        spawnParticles(player.x, player.y, 15, { color: '#88f', speed: 2, life: 1, shape: 'ring' });
      }
      break;
    }
    case 3: {
      const radius = 200;
      const dmg = 80 + player.level * 10;
      spawnParticles(player.x, player.y, 50, { color: '#f00', speed: 6, life: 2 });
      for (const e of [...enemies]) {
        if (dist(player.x, player.y, e.x, e.y) < radius) {
          e.hp -= dmg;
          damageNumbers.push({
            x: e.x,
            y: e.y,
            val: Math.floor(dmg),
            life: 1,
            color: '#f00',
            isCrit: false,
          });
          if (e.hp <= 0) onEnemyKilled(e);
        }
      }
      break;
    }
  }
}

function onEnemyKilled(enemy: Enemy) {
  sfxKill();
  const scoreValue = Math.floor(enemy.type.score * (1 + combo * 0.1));
  score += scoreValue;
  onScoreUpdate(score);
  enemiesKilledThisWave++;
  totalKills++;
  runStats.totalKills = totalKills;

  combo++;
  comboTimer = 2 + player.comboTimeBonus;
  if (combo > maxCombo) {
    maxCombo = combo;
    player.maxCombo = maxCombo;
    runStats.maxCombo = maxCombo;
  }

  spawnParticles(enemy.x, enemy.y, 20, { color: enemy.type.color, speed: 5 });
  gems.push({
    x: enemy.x,
    y: enemy.y,
    xp: enemy.type.score,
    color: enemy.type.gemColor,
    magnetized: false,
  });

  const idx = enemies.indexOf(enemy);
  if (idx > -1) enemies.splice(idx, 1);

  if (enemy.type.aiType === 'boss') {
    runStats.bossesKilled++;
  }
}

function updateCombo(dt: number) {
  if (combo > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      combo = 0;
    }
  }
}

function updateInvincibility(dt: number) {
  if (player.invincible > 0) {
    player.invincible -= dt;
  }
}

function updateShield(dt: number) {
  if (player.shieldActive) {
    player.shieldTimer -= dt;
    if (player.shieldTimer <= 0) {
      player.shieldActive = false;
    }
  }
}

function updateEnemies(dt: number) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const d = dist(e.x, e.y, player.x, player.y);
    const a = angle(e.x, e.y, player.x, player.y);

    e.animPhase += dt;

    if (e.type.aiType === 'ranged') {
      const rangeKeep = e.type.rangeKeep ?? 180;
      if (d > rangeKeep + 50) {
        e.x += Math.cos(a) * e.type.speed * dt;
        e.y += Math.sin(a) * e.type.speed * dt;
      } else if (d < rangeKeep - 50) {
        e.x -= Math.cos(a) * e.type.speed * 0.5 * dt;
        e.y -= Math.sin(a) * e.type.speed * 0.5 * dt;
      }
      e.stateTimer -= dt;
      if (e.stateTimer <= 0 && d < 400) {
        e.stateTimer = e.type.fireRate ?? 2;
        projectiles.push({
          x: e.x,
          y: e.y,
          angle: a,
          speed: 300,
          damage: e.type.damage,
          life: 2,
          size: 4,
          color: e.type.color,
          pierce: false,
          isEnemy: true,
        });
      }
    } else if (e.type.aiType === 'healer') {
      let healed = false;
      for (const other of enemies) {
        if (other !== e && dist(e.x, e.y, other.x, other.y) < (e.type.healRadius ?? 130)) {
          other.hp = Math.min(other.maxHp, other.hp + 5 * dt);
          healed = true;
        }
      }
      if (!healed || d > 200) {
        e.x += Math.cos(a) * e.type.speed * dt;
        e.y += Math.sin(a) * e.type.speed * dt;
      }
    } else if (e.type.aiType === 'charger') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0 && d < 300) {
        e.state = 'charging';
        e.stateTimer = 0.5;
        e.chargeVx = Math.cos(a) * (e.type.chargeSpeed ?? 380);
        e.chargeVy = Math.sin(a) * (e.type.chargeSpeed ?? 380);
      }
      if (e.state === 'charging') {
        e.x += e.chargeVx * dt;
        e.y += e.chargeVy * dt;
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'chase';
          e.stateTimer = e.type.chargeCooldown ?? 4;
        }
      } else {
        e.x += Math.cos(a) * e.type.speed * dt;
        e.y += Math.sin(a) * e.type.speed * dt;
      }
    } else if (e.type.aiType === 'phantom') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.state = e.state === 'phased' ? 'chase' : 'phased';
        e.stateTimer = e.type.phaseTime ?? 2.5;
      }
      if (e.state !== 'phased') {
        e.x += Math.cos(a) * e.type.speed * dt;
        e.y += Math.sin(a) * e.type.speed * dt;
      }
    } else if (e.type.aiType === 'boss') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.stateTimer = 3;
        for (let j = 0; j < 3; j++) {
          const projAngle = a + (j - 1) * 0.3;
          projectiles.push({
            x: e.x,
            y: e.y,
            angle: projAngle,
            speed: 250,
            damage: e.type.damage * 0.5,
            life: 3,
            size: 6,
            color: e.type.color,
            pierce: false,
            isEnemy: true,
          });
        }
      }
      e.x += Math.cos(a) * e.type.speed * dt;
      e.y += Math.sin(a) * e.type.speed * dt;
    } else {
      e.x += Math.cos(a) * e.type.speed * dt;
      e.y += Math.sin(a) * e.type.speed * dt;
    }

    if (d < 20 && e.state !== 'phased') {
      let damage = e.type.damage * dt;
      if (player.shieldActive) damage *= 0.3;
      if (player.juggernautDR > 0) damage *= 1 - player.juggernautDR;

      if (player.invincible <= 0) {
        player.hp -= damage;
        if (player.thornsDamage > 0) {
          e.hp -= player.thornsDamage * dt;
          if (e.hp <= 0) onEnemyKilled(e);
        }
      }

      if (player.hp <= 0) {
        handlePlayerDeath();
      }
    }
  }
}

function updateProjectiles(dt: number) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    p.life -= dt;

    let hit = false;

    if (p.isEnemy) {
      if (dist(p.x, p.y, player.x, player.y) < player.size + p.size) {
        let damage = p.damage;
        if (player.shieldActive) damage *= 0.3;
        if (player.juggernautDR > 0) damage *= 1 - player.juggernautDR;

        if (player.invincible <= 0) {
          player.hp -= damage;
          sfxHit();
          spawnParticles(player.x, player.y, 5, { color: p.color, speed: 2 });
          damageNumbers.push({
            x: player.x,
            y: player.y,
            val: Math.floor(damage),
            life: 1,
            color: '#f44',
            isCrit: false,
          });
        }
        hit = true;

        if (player.hp <= 0) {
          handlePlayerDeath();
        }
      }
    } else {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (e.state === 'phased') continue;
        if (dist(p.x, p.y, e.x, e.y) < e.type.size + p.size) {
          e.hp -= p.damage;
          sfxHit();
          spawnParticles(e.x, e.y, 5, { color: e.type.color, speed: 2 });
          damageNumbers.push({
            x: e.x,
            y: e.y,
            val: Math.floor(p.damage),
            life: 1,
            color: '#fff',
            isCrit: false,
          });

          if (player.lifeSteal > 0) {
            player.hp = Math.min(player.maxHp, player.hp + p.damage * player.lifeSteal);
          }

          if (e.hp <= 0) {
            onEnemyKilled(e);
          }
          hit = true;
          if (!p.pierce) break;
        }
      }
    }

    if (hit && !p.pierce) {
      projectiles.splice(i, 1);
    } else if (p.life <= 0) {
      projectiles.splice(i, 1);
    }
  }
}

function handlePlayerDeath() {
  if (playerUpgrades['secondWind_1'] && !player.usedSecondWind) {
    player.usedSecondWind = true;
    player.hp = player.undyingActive ? player.maxHp * 0.8 : player.maxHp * 0.5;
    player.invincible = 3;
    spawnParticles(player.x, player.y, 40, { color: '#0f0', speed: 6, life: 1.5 });
  } else {
    isPlaying = false;
    runStats.maxWave = Math.max(runStats.maxWave, wave);
    runStats.bestScore = Math.max(runStats.bestScore, score);
    runStats.maxLevel = Math.max(runStats.maxLevel, player.level);
    onGameOver(score, wave);
    onStatsUpdate(runStats);
  }
}

function updateGems(dt: number) {
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    const d = dist(g.x, g.y, player.x, player.y);

    if (d < 120) {
      g.magnetized = true;
    }

    if (g.magnetized) {
      const a = angle(g.x, g.y, player.x, player.y);
      const speed = d < 50 ? 600 : 300;
      g.x += Math.cos(a) * speed * dt;
      g.y += Math.sin(a) * speed * dt;
    }

    if (d < 20) {
      player.xp += g.xp;
      sfxGemPickup();
      gems.splice(i, 1);

      if (player.xp >= player.maxXp) {
        player.level++;
        player.xp -= player.maxXp;
        player.maxXp = Math.floor(player.maxXp * 1.5);
        upgradePoints += 1;
        runStats.maxLevel = Math.max(runStats.maxLevel, player.level);
        sfxLevelUp();
        isPlaying = false;
        onLevelUp();
        onStatsUpdate(runStats);
      }
    }
  }
}

function updateParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update(dt, gameTime)) {
      particles.splice(i, 1);
    }
  }
}

function updateDamageNumbers(dt: number) {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dn = damageNumbers[i];
    dn.y -= 50 * dt;
    dn.life -= dt;
    if (dn.life <= 0) damageNumbers.splice(i, 1);
  }
}

function updateToasts(dt: number) {
  for (let i = achievementToasts.length - 1; i >= 0; i--) {
    achievementToasts[i].life -= dt;
    if (achievementToasts[i].life <= 0) achievementToasts.splice(i, 1);
  }
  for (let i = synergyToasts.length - 1; i >= 0; i--) {
    synergyToasts[i].life -= dt;
    if (synergyToasts[i].life <= 0) synergyToasts.splice(i, 1);
  }
}

function spawnEnemies(dt: number) {
  const spawnRate = 0.03 + wave * 0.008;
  const maxEnemies = Math.min(50 + wave * 10, 200);

  if (Math.random() < spawnRate && enemies.length < maxEnemies) {
    const spawnAngle = Math.random() * TAU;
    const spawnDist = Math.max(canvasWidth, canvasHeight) / 2 + 100;

    let type = ENEMY_TYPES.beetle;
    const roll = Math.random();
    if (wave >= 8 && roll < 0.05) type = ENEMY_TYPES.shaman;
    else if (wave >= 6 && roll < 0.1) type = ENEMY_TYPES.phantom;
    else if (wave >= 5 && roll < 0.15) type = ENEMY_TYPES.charger;
    else if (wave >= 4 && roll < 0.2) type = ENEMY_TYPES.spitter;
    else if (wave >= 3 && roll < 0.3) type = ENEMY_TYPES.hornet;
    else if (wave >= 2 && roll < 0.4) type = ENEMY_TYPES.soldier;

    const waveMult = 1 + wave * 0.15;
    enemies.push({
      x: player.x + Math.cos(spawnAngle) * spawnDist,
      y: player.y + Math.sin(spawnAngle) * spawnDist,
      hp: type.health * waveMult,
      maxHp: type.health * waveMult,
      type,
      vx: 0,
      vy: 0,
      animPhase: Math.random() * TAU,
      state: 'chase',
      stateTimer: Math.random() * 2,
      id: Math.random().toString(36).substring(7),
      chargeVx: 0,
      chargeVy: 0,
    });
  }
}

function updateWaveProgression() {
  const killsNeeded = wave * 15 + Math.floor(wave * wave * 0.5);
  if (enemiesKilledThisWave >= killsNeeded) {
    wave++;
    enemiesKilledThisWave = 0;
    onWaveUpdate(wave);
    runStats.maxWave = Math.max(runStats.maxWave, wave);

    if (wave % 5 === 0) {
      const spawnAngle = Math.random() * TAU;
      const spawnDist = Math.max(canvasWidth, canvasHeight) / 2 + 100;
      const bossType = wave >= 15 ? ENEMY_TYPES.voidQueen : ENEMY_TYPES.hiveMother;
      const waveMult = 1 + wave * 0.2;
      enemies.push({
        x: player.x + Math.cos(spawnAngle) * spawnDist,
        y: player.y + Math.sin(spawnAngle) * spawnDist,
        hp: bossType.health * waveMult,
        maxHp: bossType.health * waveMult,
        type: bossType,
        vx: 0,
        vy: 0,
        animPhase: Math.random() * TAU,
        state: 'chase',
        stateTimer: 3,
        id: 'boss_' + wave,
        chargeVx: 0,
        chargeVy: 0,
      });
    }
  }
}

function draw(ctx: CanvasRenderingContext2D) {
  const camX = player.x - canvasWidth / 2;
  const camY = player.y - canvasHeight / 2;

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(-camX, -camY);

  drawGrid(ctx, camX, camY);
  drawGems(ctx);
  drawEnemies(ctx);
  drawProjectiles(ctx);
  drawParticles(ctx);
  drawPlayer(ctx, camX, camY);
  drawDamageNumbers(ctx);

  ctx.restore();

  drawMinimap();
}

function drawGrid(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  const gridSize = 100;
  const startX = Math.floor(camX / gridSize) * gridSize;
  const startY = Math.floor(camY / gridSize) * gridSize;

  ctx.beginPath();
  for (let x = startX; x < startX + canvasWidth + gridSize; x += gridSize) {
    ctx.moveTo(x, camY);
    ctx.lineTo(x, camY + canvasHeight);
  }
  for (let y = startY; y < startY + canvasHeight + gridSize; y += gridSize) {
    ctx.moveTo(camX, y);
    ctx.lineTo(camX + canvasWidth, y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  const bigGrid = gridSize * 5;
  const bigStartX = Math.floor(camX / bigGrid) * bigGrid;
  const bigStartY = Math.floor(camY / bigGrid) * bigGrid;
  ctx.beginPath();
  for (let x = bigStartX; x < bigStartX + canvasWidth + bigGrid; x += bigGrid) {
    ctx.moveTo(x, camY);
    ctx.lineTo(x, camY + canvasHeight);
  }
  for (let y = bigStartY; y < bigStartY + canvasHeight + bigGrid; y += bigGrid) {
    ctx.moveTo(camX, y);
    ctx.lineTo(camX + canvasWidth, y);
  }
  ctx.stroke();
}

function drawGems(ctx: CanvasRenderingContext2D) {
  for (const g of gems) {
    ctx.save();
    ctx.fillStyle = g.color;
    ctx.shadowColor = g.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 4 + Math.sin(gameTime * 3) * 1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D) {
  for (const e of enemies) {
    const rendType = e.state === 'phased' ? 'moth' : e.type.rendType;
    InsectRenderer.drawBeetle(
      ctx,
      e.x,
      e.y,
      e.type.size,
      angle(e.x, e.y, player.x, player.y),
      e.animPhase,
      e.hp,
      e.maxHp,
      rendType,
      e.state === 'phased' ? 0.3 : 1
    );
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D) {
  for (const p of projectiles) {
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(p.x - Math.cos(p.angle) * 8, p.y - Math.sin(p.angle) * 8, p.size * 0.7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    p.draw(ctx);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
  let playerAngle = angle(player.x, player.y, mouseX + camX, mouseY + camY);
  if (isAutoAttack && enemies.length > 0) {
    let closest = enemies[0];
    let closestDist = distSq(player.x, player.y, closest.x, closest.y);
    for (let i = 1; i < enemies.length; i++) {
      const d = distSq(player.x, player.y, enemies[i].x, enemies[i].y);
      if (d < closestDist) {
        closestDist = d;
        closest = enemies[i];
      }
    }
    playerAngle = angle(player.x, player.y, closest.x, closest.y);
  }

  const alpha = player.invincible > 0 ? 0.5 + Math.sin(gameTime * 20) * 0.3 : 1;
  InsectRenderer.drawBeetle(
    ctx,
    player.x,
    player.y,
    15,
    playerAngle,
    gameTime * 10,
    player.hp,
    player.maxHp,
    'basic',
    alpha
  );

  if (player.shieldActive) {
    ctx.save();
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 + Math.sin(gameTime * 5) * 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 25, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

function drawDamageNumbers(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px "Rajdhani", sans-serif';
  for (const dn of damageNumbers) {
    ctx.save();
    ctx.globalAlpha = dn.life;
    ctx.fillStyle = dn.color;
    if (dn.isCrit) {
      ctx.font = 'bold 18px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ff0';
    }
    ctx.fillText(dn.val.toString(), dn.x, dn.y);
    ctx.restore();
  }
}

function drawMinimap() {
  if (!minimapCtx) return;
  const size = 140;
  minimapCtx.fillStyle = '#111';
  minimapCtx.fillRect(0, 0, size, size);

  const scale = size / WORLD_SIZE;

  minimapCtx.fillStyle = 'rgba(0, 255, 100, 0.1)';
  minimapCtx.fillRect(0, 0, size, size);

  for (const e of enemies) {
    minimapCtx.fillStyle = e.type.aiType === 'boss' ? '#f00' : e.type.color;
    const s = e.type.aiType === 'boss' ? 4 : 2;
    minimapCtx.fillRect(e.x * scale, e.y * scale, s, s);
  }

  minimapCtx.fillStyle = '#fff';
  minimapCtx.fillRect(player.x * scale - 1, player.y * scale - 1, 3, 3);

  minimapCtx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(0, 0, size, size);
}

export function getAchievementToasts() {
  return [...achievementToasts];
}

export function getSynergyToasts() {
  return [...synergyToasts];
}

export function getEnemyCount() {
  return enemies.length;
}

export function getKillCount() {
  return totalKills;
}
