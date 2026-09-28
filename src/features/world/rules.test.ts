import { describe, expect, it } from 'vitest';
import { applyDay, createGenesis, WorldRuleError, type DayChoice } from './apply';
import { addDays } from './calendar';
import { WorldContext } from './context';
import { checkPlacement, candidateTiles } from './rules';
import type { World } from './schema';

const GENESIS = '2026-09-28';

/** Build a world by applying choices on consecutive days. */
function grow(choices: Omit<DayChoice, 'source'>[], start: World = createGenesis(GENESIS)): World {
  let world = start;
  choices.forEach((choice, i) => {
    world = applyDay(world, { ...choice, source: 'claude' }, addDays(GENESIS, i + 1)).world;
  });
  return world;
}

describe('ground rules', () => {
  it('lets land rise only from water that touches the island', () => {
    const ctx = new WorldContext(createGenesis(GENESIS));
    expect(checkPlacement(ctx, { action: 'land', x: 30, y: 31 })).toBeNull();
    expect(checkPlacement(ctx, { action: 'land', x: 10, y: 10 })).toMatch(/touch the island/);
    expect(checkPlacement(ctx, { action: 'land', x: 31, y: 32 })).toMatch(/only rise from water/);
  });

  it('keeps a margin of open sea along the map edge', () => {
    const ctx = new WorldContext(createGenesis(GENESIS));
    expect(checkPlacement(ctx, { action: 'land', x: 1, y: 1 })).not.toBeNull();
  });

  it('needs an inland tile for the very first meadow and grows grass from grass afterwards', () => {
    const ctx = new WorldContext(createGenesis(GENESIS));
    expect(candidateTiles(ctx, 'meadow')).toEqual([
      [31, 32],
      [32, 32],
    ]);
    const world = grow([{ action: 'meadow', x: 31, y: 32 }]);
    expect(checkPlacement(new WorldContext(world), { action: 'meadow', x: 32, y: 32 })).toBeNull();
  });

  it('never turns the coast into grass', () => {
    const ctx = new WorldContext(createGenesis(GENESIS));
    expect(checkPlacement(ctx, { action: 'meadow', x: 30, y: 32 })).toMatch(/coast stays sandy/);
  });
});

describe('dependencies between elements', () => {
  const village = () =>
    grow([
      { action: 'meadow', x: 31, y: 32 },
      { action: 'meadow', x: 32, y: 32 },
      { action: 'house', x: 31, y: 32 },
      { action: 'inhabitant', x: 31, y: 32, name: 'Mara', role: 'carpenter' },
    ]);

  it('requires a house before anyone can move in', () => {
    const ctx = new WorldContext(createGenesis(GENESIS));
    expect(checkPlacement(ctx, { action: 'inhabitant', x: 31, y: 32 })).toMatch(/moves into a house/);
  });

  it('keeps a tile of space between houses', () => {
    const ctx = new WorldContext(village());
    expect(checkPlacement(ctx, { action: 'house', x: 32, y: 32 })).toMatch(/space between/);
  });

  it('allows only trades that fit the island', () => {
    const ctx = new WorldContext(village());
    expect(checkPlacement(ctx, { action: 'inhabitant', x: 31, y: 32, role: 'keeper' })).toMatch(/does not fit/);
    expect(checkPlacement(ctx, { action: 'inhabitant', x: 31, y: 32, role: 'child' })).toBeNull();
  });

  it('needs three houses for a library and a path next to it', () => {
    const ctx = new WorldContext(village());
    expect(checkPlacement(ctx, { action: 'library', x: 32, y: 32 })).toMatch(/three houses/);
  });

  it('needs rock on the coast for the lighthouse', () => {
    const ctx = new WorldContext(village());
    expect(checkPlacement(ctx, { action: 'lighthouse', x: 30, y: 32 })).toMatch(/rock on the coast/);
  });
});

describe('applyDay', () => {
  it('adds exactly one change and one log line per day', () => {
    const before = createGenesis(GENESIS);
    const { world, entry } = applyDay(before, { action: 'land', x: 30, y: 31, source: 'director' }, '2026-09-29');
    expect(entry.day).toBe(1);
    expect(world.days).toHaveLength(2);
    expect(world.terrain.filter((row, y) => row !== before.terrain[y])).toHaveLength(1);
    expect(before.days).toHaveLength(1); // input untouched
  });

  it('refuses a second change on the same day', () => {
    const world = grow([{ action: 'land', x: 30, y: 31 }]);
    expect(() => applyDay(world, { action: 'land', x: 33, y: 31, source: 'claude' }, '2026-09-29')).toThrow(WorldRuleError);
  });

  it('rejects lore with links, mentions or line breaks', () => {
    const base = createGenesis(GENESIS);
    for (const lore of ['see https://example.com', 'thanks @someone', 'two\nlines']) {
      expect(() => applyDay(base, { action: 'land', x: 30, y: 31, lore, source: 'claude' }, '2026-09-29')).toThrow(
        WorldRuleError,
      );
    }
  });

  it('refuses duplicate names', () => {
    const world = grow([
      { action: 'meadow', x: 31, y: 32 },
      { action: 'house', x: 31, y: 32 },
      { action: 'inhabitant', x: 31, y: 32, name: 'Mara', role: 'carpenter' },
    ]);
    expect(() =>
      applyDay(world, { action: 'inhabitant', x: 31, y: 32, name: 'Mara', role: 'child', source: 'claude' }, '2026-10-02'),
    ).toThrow(/already lives/);
  });
});
