export type GameState = 'loading' | 'title' | 'classselect' | 'playing' | 'gameover' | 'upgrading';

export interface AbilityState {
  name: string;
  cooldown: number;
  maxCooldown: number;
  baseCooldown: number;
  active: boolean;
  duration: number;
}

export interface HeroStats {
  speed: number;
  health: number;
  damage: number;
  attackRate: number;
  range: number;
}

export interface HeroClass {
  id: string;
  emoji: string;
  name: string;
  role: string;
  lore: string;
  color: string;
  stats: HeroStats;
  statLabels: {
    speed: number;
    health: number;
    damage: number;
    attackRate: number;
    range: number;
  };
  passive: string;
}

export interface UpgradeDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  maxLevel: number;
  rarity: 'common' | 'rare' | 'legendary';
  costs: number[];
  value: number;
}

export interface UserData {
  uid: string;
  bestScore: number;
  bestWave: number;
  bestCombo: number;
  runs: number;
  achievements: string[];
  totalGemsCollected: number;
  totalKills: number;
}

export interface EnemyType {
  id?: string;
  health: number;
  speed: number;
  size: number;
  damage: number;
  score: number;
  rendType: string;
  aiType: string;
  color: string;
  gemColor: string;
  rangeKeep?: number;
  fireRate?: number;
  healRadius?: number;
  healRate?: number;
  chargeSpeed?: number;
  chargeCooldown?: number;
  phaseTime?: number;
  bossPhases?: number;
}

export interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: EnemyType;
  vx: number;
  vy: number;
  animPhase: number;
  state: string;
  stateTimer: number;
  id: string;
}
