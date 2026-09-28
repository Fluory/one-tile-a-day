import { describe, expect, it } from 'vitest';
import { applyDay, createGenesis } from './apply';
import { addDays } from './calendar';
import { WorldContext } from './context';
import { recommend } from './director';
import { validateWorld, worldAt } from './history';

const GENESIS = '2026-09-28';

function simulate(days: number) {
  let world = createGenesis(GENESIS);
  for (let d = 1; d <= days; d++) {
    const pick = recommend(new WorldContext(world), d);
    world = applyDay(world, { ...pick, source: 'director' }, addDays(GENESIS, d)).world;
  }
  return world;
}

describe('a simulated quarter year', () => {
  const world = simulate(90);

  it('stays valid every single day', () => {
    expect(validateWorld(world)).toEqual([]);
  });

  it('is deterministic', () => {
    expect(simulate(90)).toEqual(world);
  });

  it('builds a village before the season ends', () => {
    const ctx = new WorldContext(world);
    expect(ctx.count('house')).toBeGreaterThan(0);
    expect(ctx.count('inhabitant')).toBeGreaterThan(0);
    expect(ctx.land).toBeGreaterThan(30);
  });

  it('can travel back in time to any day', () => {
    const day30 = worldAt(world, 30);
    expect(day30.days[day30.days.length - 1]?.day).toBe(30);
    expect(validateWorld(day30)).toEqual([]);
    expect(worldAt(world, 0).terrain).toEqual(createGenesis(GENESIS).terrain);
  });
});

describe('validateWorld', () => {
  it('detects a log that was edited by hand', () => {
    const world = simulate(5);
    const tampered = { ...world, days: world.days.map((d, i) => (i === 3 ? { ...d, date: '2027-01-01' } : d)) };
    expect(validateWorld(tampered).length).toBeGreaterThan(0);
  });

  it('detects two buildings on one tile', () => {
    const world = simulate(40);
    const house = world.elements.find((e) => e.type === 'house');
    if (!house) throw new Error('expected a house after 40 days');
    const clash = { ...house, id: 'e999' };
    expect(validateWorld({ ...world, elements: [...world.elements, clash] }).join()).toMatch(/share tile/);
  });
});
