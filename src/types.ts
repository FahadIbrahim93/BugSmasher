export type GameState = 'loading' | 'title' | 'classselect' | 'playing' | 'gameover' | 'upgrading';

export interface AbilityState {
  name: string;
  cooldown: number;
  maxCooldown: number;
  baseCooldown: number;
  active: boolean;
  duration: number;
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
