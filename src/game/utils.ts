export const WORLD_SIZE = 4000;
export const TAU = Math.PI * 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
export const dist = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
export const distSq = (x1: number, y1: number, x2: number, y2: number) =>
  (x2 - x1) ** 2 + (y2 - y1) ** 2;
export const angle = (x1: number, y1: number, x2: number, y2: number) =>
  Math.atan2(y2 - y1, x2 - x1);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function seededRand(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`;
}
export function rgb(r: number, g: number, b: number, a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

export function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export const ACHIEVEMENT_DEFS = [
  {
    id: 'first_blood',
    name: 'FIRST BLOOD',
    icon: '🩸',
    desc: 'Kill your first enemy',
    check: (s: RunStats) => s.totalKills >= 1,
  },
  {
    id: 'centurion',
    name: 'CENTURION',
    icon: '💀',
    desc: 'Kill 100 enemies',
    check: (s: RunStats) => s.totalKills >= 100,
  },
  {
    id: 'exterminator',
    name: 'EXTERMINATOR',
    icon: '☠️',
    desc: 'Kill 1000 enemies',
    check: (s: RunStats) => s.totalKills >= 1000,
  },
  {
    id: 'wave_5',
    name: 'SURVIVOR',
    icon: '🌊',
    desc: 'Reach wave 5',
    check: (s: RunStats) => s.maxWave >= 5,
  },
  {
    id: 'wave_10',
    name: 'VETERAN',
    icon: '⚔️',
    desc: 'Reach wave 10',
    check: (s: RunStats) => s.maxWave >= 10,
  },
  {
    id: 'wave_25',
    name: 'APEX PREDATOR',
    icon: '👑',
    desc: 'Reach wave 25',
    check: (s: RunStats) => s.maxWave >= 25,
  },
  {
    id: 'score_1000',
    name: 'HIGH SCORER',
    icon: '⭐',
    desc: 'Score 1000 points',
    check: (s: RunStats) => s.bestScore >= 1000,
  },
  {
    id: 'score_5000',
    name: 'LEGEND',
    icon: '🏆',
    desc: 'Score 5000 points',
    check: (s: RunStats) => s.bestScore >= 5000,
  },
  {
    id: 'combo_10',
    name: 'COMBO MASTER',
    icon: '🔥',
    desc: 'Reach 10x combo',
    check: (s: RunStats) => s.maxCombo >= 10,
  },
  {
    id: 'combo_25',
    name: 'UNSTOPPABLE',
    icon: '💥',
    desc: 'Reach 25x combo',
    check: (s: RunStats) => s.maxCombo >= 25,
  },
  {
    id: 'level_10',
    name: 'EVOLVED',
    icon: '🧬',
    desc: 'Reach level 10',
    check: (s: RunStats) => s.maxLevel >= 10,
  },
  {
    id: 'level_20',
    name: 'TRANSCENDED',
    icon: '✨',
    desc: 'Reach level 20',
    check: (s: RunStats) => s.maxLevel >= 20,
  },
  {
    id: 'synergy_1',
    name: 'SYNERGIST',
    icon: '🔗',
    desc: 'Activate 1 synergy',
    check: (s: RunStats) => s.synergiesActivated >= 1,
  },
  {
    id: 'synergy_5',
    name: 'HIVE MIND',
    icon: '🧠',
    desc: 'Activate 5 synergies',
    check: (s: RunStats) => s.synergiesActivated >= 5,
  },
  {
    id: 'boss_slayer',
    name: 'BOSS SLAYER',
    icon: '🗡️',
    desc: 'Defeat a boss',
    check: (s: RunStats) => s.bossesKilled >= 1,
  },
  {
    id: 'daily_win',
    name: 'DAILY CHAMPION',
    icon: '👑',
    desc: 'Complete a daily seed run',
    check: (s: RunStats) => s.dailyCompleted,
  },
];

export interface RunStats {
  totalKills: number;
  maxWave: number;
  bestScore: number;
  maxCombo: number;
  maxLevel: number;
  synergiesActivated: number;
  bossesKilled: number;
  dailyCompleted: boolean;
  timePlayed: number;
}

export const Log = (() => {
  const PREFIX = '[INSECTILES]';
  const VERBOSE = false;
  return {
    info(scope: string, msg: string, data?: unknown) {
      if (!VERBOSE) return;
      console.info(`${PREFIX} [${scope}]`, msg, data !== undefined ? data : '');
    },
    warn(scope: string, msg: string, data?: unknown) {
      console.warn(`${PREFIX} [${scope}]`, msg, data !== undefined ? data : '');
    },
    error(scope: string, msg: string, err?: unknown) {
      console.error(`${PREFIX} [${scope}]`, msg, err !== undefined ? err : '');
    },
  };
})();
