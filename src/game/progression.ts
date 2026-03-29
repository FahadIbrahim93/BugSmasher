import { player } from './player';
import type { UpgradeDef } from '../types';

export function pickUpgradeOptions(upgrades: UpgradeDef[], count = 3): UpgradeDef[] {
  const pool = [...upgrades];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function applyUpgrade(upgrade: UpgradeDef): void {
  if (upgrade.id.startsWith('dmg_')) {
    player.attackDamage += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('spd_')) {
    player.speed += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('hp_')) {
    player.maxHp += upgrade.value;
    player.hp += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('rate_')) {
    player.attackRate *= 1 - upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('range_')) {
    player.attackRange += upgrade.value;
    return;
  }

  if (upgrade.id.startsWith('heal_')) {
    player.hp = Math.min(player.maxHp, player.hp + upgrade.value);
  }
}
