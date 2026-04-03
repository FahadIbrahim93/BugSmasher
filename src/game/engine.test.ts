import { getPlayerState } from './engine';
import { player } from './player';

describe('engine state', () => {
  test('getPlayerState returns live player values', () => {
    player.hp = 123;
    player.maxHp = 456;
    player.xp = 78;
    player.maxXp = 90;
    player.level = 7;
    const state = getPlayerState();
    expect(state).toMatchObject({
      hp: 123,
      maxHp: 456,
      xp: 78,
      maxXp: 90,
      level: 7,
      abilities: expect.any(Array),
    });
  });
});
