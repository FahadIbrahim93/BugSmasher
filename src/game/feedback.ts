import { TAU, lerp } from './utils';
import { spawnParticles } from './particles';

export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  color: string;
  life: number;
  maxLife: number;
  isCrit: boolean;
  isHeal: boolean;
}

export interface ScreenShake {
  intensity: number;
  maxIntensity: number;
  duration: number;
  maxDuration: number;
  offsetX: number;
  offsetY: number;
}

export interface CombatEffect {
  type: 'hit' | 'kill' | 'levelup' | 'synergy' | 'ability';
  x: number;
  y: number;
  data?: any;
  duration: number;
  maxDuration: number;
}

export const damageNumbers: DamageNumber[] = [];
export const screenShake: ScreenShake = {
  intensity: 0,
  maxIntensity: 0,
  duration: 0,
  maxDuration: 0,
  offsetX: 0,
  offsetY: 0
};

export const combatEffects: CombatEffect[] = [];

export function spawnDamageNumber(x: number, y: number, value: number, config: any = {}) {
  const isCrit = config.isCrit || false;
  const isHeal = config.isHeal || false;
  const color = isHeal ? '#00ff88' : isCrit ? '#ffff00' : config.color || '#ff6666';
  
  damageNumbers.push({
    x,
    y,
    value: Math.ceil(value),
    color,
    life: isCrit ? 1.5 : 1.0,
    maxLife: isCrit ? 1.5 : 1.0,
    isCrit,
    isHeal
  });

  // Spawn particles for critical hits
  if (isCrit) {
    spawnParticles(x, y, 8, {
      minSpeed: 80,
      maxSpeed: 150,
      minLife: 0.5,
      maxLife: 0.9,
      minSize: 3,
      maxSize: 6,
      color: '#ffff00',
      drag: 0.92,
      shape: 'spark'
    });
  }
}

export function triggerScreenShake(intensity: number, duration: number = 0.15) {
  screenShake.intensity = Math.min(intensity, 12);
  screenShake.maxIntensity = intensity;
  screenShake.duration = duration;
  screenShake.maxDuration = duration;
}

export function updateScreenShake(dt: number) {
  if (screenShake.duration <= 0) {
    screenShake.offsetX = 0;
    screenShake.offsetY = 0;
    return;
  }

  screenShake.duration -= dt;
  const progress = 1 - screenShake.duration / screenShake.maxDuration;
  
  // Ease out the shake
  const easeProgress = Math.pow(1 - progress, 2);
  const currentIntensity = screenShake.maxIntensity * easeProgress;
  
  // Random offset
  screenShake.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
  screenShake.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
}

export function updateDamageNumbers(dt: number) {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const num = damageNumbers[i];
    num.life -= dt;
    num.y -= dt * 60; // Float upward

    if (num.life <= 0) {
      damageNumbers.splice(i, 1);
    }
  }
}

export function drawDamageNumbers(
  cx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  canvasWidth: number,
  canvasHeight: number
) {
  for (const num of damageNumbers) {
    const screenX = num.x - cameraX;
    const screenY = num.y - cameraY;

    if (screenX < -100 || screenX > canvasWidth + 100 || screenY < -100 || screenY > canvasHeight + 100) {
      continue;
    }

    const alpha = Math.pow(num.life / num.maxLife, 0.5);
    const scale = num.isCrit ? 1.3 : 1;
    const size = (num.isCrit ? 18 : 14) * scale;

    cx.save();
    cx.globalAlpha = alpha;
    cx.translate(screenX, screenY);

    // Draw outline for visibility
    cx.font = `bold ${size}px 'Share Tech Mono', monospace`;
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    cx.lineWidth = 3;
    cx.strokeText(num.value.toString(), 0, 0);

    // Draw number
    cx.fillStyle = num.color;
    cx.fillText(num.value.toString(), 0, 0);

    // Draw glow for crits
    if (num.isCrit) {
      cx.globalAlpha = alpha * 0.4;
      cx.strokeStyle = num.color;
      cx.lineWidth = 1;
      cx.strokeText(num.value.toString(), 0, 0);
    }

    cx.restore();
  }
}

export function triggerCombatEffect(type: CombatEffect['type'], x: number, y: number, data?: any) {
  const durations = {
    hit: 0.15,
    kill: 0.6,
    levelup: 1.2,
    synergy: 1.5,
    ability: 0.5
  };

  combatEffects.push({
    type,
    x,
    y,
    data,
    duration: durations[type],
    maxDuration: durations[type]
  });

  // Trigger appropriate particle effects
  switch (type) {
    case 'hit':
      triggerScreenShake(2, 0.12);
      spawnParticles(x, y, 6, {
        minSpeed: 40,
        maxSpeed: 100,
        minLife: 0.3,
        maxLife: 0.6,
        minSize: 2,
        maxSize: 4,
        color: '#ff8844',
        drag: 0.94,
        shape: 'spark'
      });
      break;

    case 'kill':
      triggerScreenShake(4, 0.2);
      spawnParticles(x, y, 20, {
        minSpeed: 60,
        maxSpeed: 180,
        minLife: 0.5,
        maxLife: 1.2,
        minSize: 3,
        maxSize: 7,
        colors: ['#00ff88', '#00dd66', '#00cc44'],
        drag: 0.92,
        shape: 'circle',
        gravity: -50
      });
      break;

    case 'levelup':
      spawnParticles(x, y, 30, {
        minSpeed: 50,
        maxSpeed: 200,
        minLife: 0.8,
        maxLife: 1.5,
        minSize: 4,
        maxSize: 8,
        colors: ['#ffd700', '#ffff00', '#ffaa00'],
        drag: 0.88,
        shape: 'spark'
      });
      triggerScreenShake(5, 0.25);
      break;

    case 'synergy':
      spawnParticles(x, y, 40, {
        minSpeed: 80,
        maxSpeed: 220,
        minLife: 0.7,
        maxLife: 1.4,
        minSize: 3,
        maxSize: 9,
        colors: ['#00ff88', '#00ffff', '#88ff00'],
        drag: 0.90,
        shape: 'ring',
        gravity: -30
      });
      triggerScreenShake(6, 0.3);
      break;

    case 'ability':
      spawnParticles(x, y, 25, {
        minSpeed: 70,
        maxSpeed: 200,
        minLife: 0.6,
        maxLife: 1.2,
        minSize: 2,
        maxSize: 6,
        colors: ['#00ccff', '#0088ff', '#8800ff'],
        drag: 0.92,
        shape: 'glow'
      });
      triggerScreenShake(3, 0.18);
      break;
  }
}

export function updateCombatEffects(dt: number) {
  for (let i = combatEffects.length - 1; i >= 0; i--) {
    combatEffects[i].duration -= dt;
    if (combatEffects[i].duration <= 0) {
      combatEffects.splice(i, 1);
    }
  }
}
