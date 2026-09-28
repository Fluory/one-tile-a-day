import worldJson from '../../../world/world.json';
import {
  addDays,
  applyDay,
  createGenesis,
  parseWorld,
  recommend,
  worldStats,
  WorldContext,
  type DayEntry,
  type World,
} from '@/features/world';

/**
 * Build-time access to the island. world.json is bundled into the server build, so every
 * deployment (one per daily commit) renders exactly the state of that commit.
 */

let cached: World | undefined;

export function getWorld(): World {
  cached ??= parseWorld(worldJson);
  return cached;
}

export function getStats() {
  return worldStats(getWorld());
}

export function getLatest(): DayEntry {
  const days = getWorld().days;
  return days[days.length - 1] as DayEntry;
}

/** Newest first. */
export function getDaysNewestFirst(): DayEntry[] {
  return [...getWorld().days].reverse();
}

export function getDay(day: number): DayEntry | undefined {
  return getWorld().days.find((d) => d.day === day);
}

let simulated: World | undefined;

/**
 * A simulated first year, grown by the rule-based director from the same genesis.
 * Clearly labelled on the website – it shows what the rules can build, not the real island.
 */
export function getSimulation(days = 365): World {
  if (simulated) return simulated;
  const real = getWorld();
  let world = createGenesis(real.genesis, real.name, real.width);
  for (let d = 1; d <= days; d++) {
    const pick = recommend(new WorldContext(world), d);
    world = applyDay(world, { ...pick, source: 'director' }, addDays(real.genesis, d)).world;
  }
  simulated = world;
  return world;
}
