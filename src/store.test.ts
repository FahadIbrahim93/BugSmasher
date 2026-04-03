import { userData, unlockedAchievements } from './store';

describe('store data model', () => {
  test('default userData shape', () => {
    expect(userData).toEqual(expect.objectContaining({
      uid: expect.any(String),
      bestScore: expect.any(Number),
      bestWave: expect.any(Number),
      runs: expect.any(Number),
      achievements: expect.any(Array),
    }));
  });

  test('unlockedAchievements is a set', () => {
    expect(unlockedAchievements instanceof Set).toBe(true);
  });
});
