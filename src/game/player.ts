export interface HeroClass {
  id: string;
  emoji: string;
  name: string;
  role: string;
  lore: string;
  color: string;
  stats: {
    speed: number;
    health: number;
    damage: number;
    attackRate: number;
    range: number;
  };
  statLabels: {
    speed: number;
    health: number;
    damage: number;
    attackRate: number;
    range: number;
  };
  passive: string;
}

export interface Ability {
  name: string;
  cooldown: number;
  maxCooldown: number;
  baseCooldown: number;
  active: boolean;
  duration: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
  baseSpeed: number;
  hp: number;
  maxHp: number;
  health: number;
  maxHealth: number;
  baseMaxHealth: number;
  xp: number;
  maxXp: number;
  level: number;
  heroClass: HeroClass | null;
  angle: number;
  animPhase: number;
  state: string;
  stateTimer: number;
  attackCooldown: number;
  attackRate: number;
  baseAttackRate: number;
  attackRange: number;
  attackDamage: number;
  baseDamage: number;
  invincible: number;
  combo: number;
  comboTimer: number;
  maxCombo: number;
  abilities: Ability[];
  shieldActive: boolean;
  shieldTimer: number;
  xpGlow: number;
  upgradePoints: number;
  upgrades: Record<string, number>;
  usedSecondWind: boolean;
  juggernautDR: number;
  venomLordActive: boolean;
  ironHideActive: boolean;
  bladeStormActive: boolean;
  undyingActive: boolean;
  shieldBonusDuration: number;
  lifeSteal: number;
  critChance: number;
  thornsDamage: number;
  multiStrike: number;
  comboTimeBonus: number;
  abilityCooldownReduction: number;
}

export const player: PlayerState = {
  x: 2000,
  y: 2000,
  vx: 0,
  vy: 0,
  size: 22,
  speed: 220,
  baseSpeed: 220,
  hp: 100,
  maxHp: 100,
  health: 100,
  maxHealth: 100,
  baseMaxHealth: 100,
  xp: 0,
  maxXp: 100,
  level: 1,
  heroClass: null,
  angle: 0,
  animPhase: 0,
  state: 'idle',
  stateTimer: 0,
  attackCooldown: 0,
  attackRate: 0.25,
  baseAttackRate: 0.25,
  attackRange: 80,
  attackDamage: 25,
  baseDamage: 25,
  invincible: 0,
  combo: 0,
  comboTimer: 0,
  maxCombo: 0,
  abilities: [
    {
      name: 'Venom Burst',
      cooldown: 0,
      maxCooldown: 5,
      baseCooldown: 5,
      active: false,
      duration: 0,
    },
    {
      name: 'Lightning Sting',
      cooldown: 0,
      maxCooldown: 8,
      baseCooldown: 8,
      active: false,
      duration: 0,
    },
    {
      name: 'Chitin Shield',
      cooldown: 0,
      maxCooldown: 12,
      baseCooldown: 12,
      active: false,
      duration: 0,
    },
    {
      name: 'Death Swarm',
      cooldown: 0,
      maxCooldown: 20,
      baseCooldown: 20,
      active: false,
      duration: 0,
    },
  ],
  shieldActive: false,
  shieldTimer: 0,
  xpGlow: 0,
  upgradePoints: 0,
  upgrades: {},
  usedSecondWind: false,
  juggernautDR: 0,
  venomLordActive: false,
  ironHideActive: false,
  bladeStormActive: false,
  undyingActive: false,
  shieldBonusDuration: 0,
  lifeSteal: 0,
  critChance: 0,
  thornsDamage: 0,
  multiStrike: 0,
  comboTimeBonus: 0,
  abilityCooldownReduction: 0,
};

export const HERO_CLASSES: HeroClass[] = [
  {
    id: 'mantis',
    emoji: '🦗',
    name: 'MANTIS',
    role: 'ASSASSIN',
    lore: '"Swift as shadows, deadly as venom. The last thing prey hears is silence."',
    color: '#00ffaa',
    stats: { speed: 1.3, health: 0.8, damage: 1.3, attackRate: 0.8, range: 0.9 },
    statLabels: { speed: 85, health: 50, damage: 80, attackRate: 85, range: 55 },
    passive: 'Crits grant +0.3s combo timer',
  },
  {
    id: 'scarab',
    emoji: '🪲',
    name: 'SCARAB',
    role: 'VANGUARD',
    lore: '"Born beneath desert suns, hardened into living iron. The swarm breaks on its shell."',
    color: '#ff8844',
    stats: { speed: 0.8, health: 1.5, damage: 0.9, attackRate: 1.1, range: 1.1 },
    statLabels: { speed: 40, health: 95, damage: 55, attackRate: 60, range: 70 },
    passive: 'Thorns damage starts active from wave 1',
  },
  {
    id: 'widow',
    emoji: '🕷️',
    name: 'BLACK WIDOW',
    role: 'HUNTER',
    lore: '"Patient. Precise. Lethal. Eight eyes that see in every spectrum of death."',
    color: '#cc44ff',
    stats: { speed: 1.0, health: 0.9, damage: 1.1, attackRate: 0.95, range: 1.4 },
    statLabels: { speed: 60, health: 55, damage: 70, attackRate: 65, range: 95 },
    passive: 'Poison duration doubled, spreads on kill',
  },
];
