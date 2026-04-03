import { clamp, dist, angle, lerp, randInt } from './utils';

describe('utils', () => {
  test('clamp bounds value', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  test('dist computes correct euclidean distance', () => {
    expect(dist(0, 0, 3, 4)).toBe(5);
  });

  test('angle computes correct radians', () => {
    expect(angle(0, 0, 1, 0)).toBeCloseTo(0);
    expect(angle(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2);
  });

  test('lerp returns interpolation', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  test('randInt returns integer in range', () => {
    for (let i = 0; i < 50; i++) {
      const v = randInt(1, 5);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});
