import test from 'node:test';
import assert from 'node:assert/strict';
import { applyUpgrade, pickUpgradeOptions } from './progression';
import { player } from './player';
import type { UpgradeDef } from '../types';

const testUpgrade = (id: string, value: number): UpgradeDef => ({
  id,
  value,
  icon: 'x',
  name: id,
  desc: '',
  maxLevel: 1,
  rarity: 'common',
  costs: [0],
});

function snapshotPlayer() {
  return {
    attackDamage: player.attackDamage,
    speed: player.speed,
    maxHp: player.maxHp,
    hp: player.hp,
    attackRate: player.attackRate,
    attackRange: player.attackRange,
  };
}

function restorePlayer(snapshot: ReturnType<typeof snapshotPlayer>) {
  Object.assign(player, snapshot);
}

test('pickUpgradeOptions returns requested count and no duplicates', () => {
  const upgrades = [
    testUpgrade('u1', 1),
    testUpgrade('u2', 1),
    testUpgrade('u3', 1),
    testUpgrade('u4', 1),
  ];

  const selected = pickUpgradeOptions(upgrades, 3);
  assert.equal(selected.length, 3);
  assert.equal(new Set(selected.map((u) => u.id)).size, 3);
});

test('applyUpgrade increases damage', () => {
  const snapshot = snapshotPlayer();
  applyUpgrade(testUpgrade('dmg_1', 10));
  assert.equal(player.attackDamage, snapshot.attackDamage + 10);
  restorePlayer(snapshot);
});

test('applyUpgrade increases speed', () => {
  const snapshot = snapshotPlayer();
  applyUpgrade(testUpgrade('spd_1', 20));
  assert.equal(player.speed, snapshot.speed + 20);
  restorePlayer(snapshot);
});

test('applyUpgrade increases max hp and current hp', () => {
  const snapshot = snapshotPlayer();
  applyUpgrade(testUpgrade('hp_1', 20));
  assert.equal(player.maxHp, snapshot.maxHp + 20);
  assert.equal(player.hp, snapshot.hp + 20);
  restorePlayer(snapshot);
});

test('applyUpgrade reduces attack rate by multiplier', () => {
  const snapshot = snapshotPlayer();
  applyUpgrade(testUpgrade('rate_1', 0.1));
  assert.equal(player.attackRate, snapshot.attackRate * 0.9);
  restorePlayer(snapshot);
});

test('applyUpgrade increases attack range', () => {
  const snapshot = snapshotPlayer();
  applyUpgrade(testUpgrade('range_1', 30));
  assert.equal(player.attackRange, snapshot.attackRange + 30);
  restorePlayer(snapshot);
});

test('applyUpgrade heal cannot exceed max hp', () => {
  const snapshot = snapshotPlayer();
  player.hp = 50;
  player.maxHp = 100;
  applyUpgrade(testUpgrade('heal_1', 80));
  assert.equal(player.hp, 100);
  restorePlayer(snapshot);
});
