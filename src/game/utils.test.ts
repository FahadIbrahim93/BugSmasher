import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, dist, angle, seededRand, lerp } from './utils';

test('clamp bounds values', () => {
  assert.equal(clamp(5, 1, 10), 5);
  assert.equal(clamp(-1, 1, 10), 1);
  assert.equal(clamp(99, 1, 10), 10);
});

test('dist computes euclidean distance', () => {
  assert.equal(dist(0, 0, 3, 4), 5);
});

test('angle computes expected radians', () => {
  assert.equal(angle(0, 0, 1, 0), 0);
  assert.equal(angle(0, 0, 0, 1), Math.PI / 2);
});

test('lerp interpolates between points', () => {
  assert.equal(lerp(10, 20, 0), 10);
  assert.equal(lerp(10, 20, 0.5), 15);
  assert.equal(lerp(10, 20, 1), 20);
});

test('seededRand is deterministic for same seed', () => {
  const a = seededRand(42);
  const b = seededRand(42);

  const aSeq = [a(), a(), a(), a()];
  const bSeq = [b(), b(), b(), b()];

  assert.deepEqual(aSeq, bSeq);
});
