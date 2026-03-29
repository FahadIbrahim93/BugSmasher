import { player } from './player';
import type { UpgradeDef } from '../types';

const RARITY_WEIGHTS: Record<UpgradeDef['rarity'], number> = {
  common: 60,
  rare: 30,
  legendary: 10,
};

export function getUpgradeLevel(upgradeId: string): number {
  return player.upgrades[upgradeId] ?? 0;
}

export function isUpgradeEligible(upgrade: UpgradeDef): boolean {
  return getUpgradeLevel(upgrade.id) < upgrade.maxLevel;
}

function weightedPick(upgrades: UpgradeDef[], random: () => number): UpgradeDef | null {
  const totalWeight = upgrades.reduce((sum, upgrade) => sum + RARITY_WEIGHTS[upgrade.rarity], 0);
  if (totalWeight <= 0) {
    return null;
  }

  const roll = random() * totalWeight;
  let cursor = 0;
  for (const upgrade of upgrades) {
    cursor += RARITY_WEIGHTS[upgrade.rarity];
    if (roll <= cursor) {
      return upgrade;
    }
  }

  return upgrades.at(-1) ?? null;
}

export function pickUpgradeOptions(upgrades: UpgradeDef[], count = 3, random: () => number = Math.random): UpgradeDef[] {
  const pool = upgrades.filter(isUpgradeEligible);
  if (pool.length === 0) {
    return [];
  }

  const selected: UpgradeDef[] = [];
  const available = [...pool];

  while (selected.length < count && available.length > 0) {
    const picked = weightedPick(available, random);
    if (!picked) {
      break;
    }

    selected.push(picked);
    const idx = available.findIndex((candidate) => candidate.id === picked.id);
    if (idx >= 0) {
      available.splice(idx, 1);
    }
  }

  return selected;
}

export function applyUpgrade(upgrade: UpgradeDef): void {
  if (!isUpgradeEligible(upgrade)) {
    return;
  }

  player.upgrades[upgrade.id] = getUpgradeLevel(upgrade.id) + 1;

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
    player.hp = Math.min(player.maxHp, player.hp + upgrade.value);
    return;
  }

  if (upgrade.id.startsWith('rate_')) {
    const nextRate = player.attackRate * (1 - upgrade.value);
    player.attackRate = Math.max(0.05, nextRate);
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
