import { daysBetween } from './calendar';
import { Grid, key } from './grid';
import { isBeing, isStructure, isTerrainAction, parseWorld, type World } from './schema';

/**
 * Time travel: the world as it looked at the end of `day`. Terrain changes are reverted
 * newest-first, elements and log entries after that day are dropped.
 */
export function worldAt(world: World, day: number): World {
  const last = world.days[world.days.length - 1]?.day ?? 0;
  if (day >= last) return world;
  const grid = Grid.fromRows(world.terrain, world.width, world.height);
  for (let i = world.days.length - 1; i >= 0; i--) {
    const entry = world.days[i];
    if (!entry || entry.day <= day) break;
    if (entry.terrain) grid.set(entry.x, entry.y, entry.terrain.from);
  }
  return {
    ...world,
    terrain: grid.toRows(),
    elements: world.elements.filter((e) => e.day <= day),
    days: world.days.filter((d) => d.day <= day),
  };
}

/**
 * Structural checks over the whole history. Returns a list of problems (empty = valid).
 * Placement rules are only enforced when a day is applied, so old days stay valid even
 * when the rules evolve.
 */
export function validateWorld(input: unknown): string[] {
  const problems: string[] = [];
  let world: World;
  try {
    world = parseWorld(input);
  } catch (error) {
    return [`schema: ${(error as Error).message}`];
  }

  let grid: Grid;
  try {
    grid = Grid.fromRows(world.terrain, world.width, world.height);
  } catch (error) {
    return [`terrain: ${(error as Error).message}`];
  }

  const first = world.days[0];
  if (!first || first.action !== 'genesis' || first.day !== 0 || first.date !== world.genesis) {
    problems.push('the log must start with the genesis entry (day 0, date = genesis)');
  }
  for (let i = 1; i < world.days.length; i++) {
    const prev = world.days[i - 1];
    const entry = world.days[i];
    if (!prev || !entry) continue;
    if (entry.action === 'genesis') problems.push(`day ${entry.day}: only day 0 can be the genesis`);
    if (entry.date <= prev.date) problems.push(`day ${entry.day}: date ${entry.date} is not after ${prev.date}`);
    if (entry.day !== daysBetween(world.genesis, entry.date)) {
      problems.push(`day ${entry.day}: number does not match its date ${entry.date}`);
    }
  }

  const ids = new Set<string>();
  const occupied = new Map<string, string>();
  const byId = new Map(world.elements.map((e) => [e.id, e]));
  const residents = new Map<string, number>();
  for (const element of world.elements) {
    if (ids.has(element.id)) problems.push(`element ${element.id} appears twice`);
    ids.add(element.id);
    const entry = world.days.find((d) => d.element === element.id);
    if (!entry) problems.push(`element ${element.id} has no log entry`);
    else if (entry.day !== element.day || entry.action !== element.type || entry.x !== element.x || entry.y !== element.y) {
      problems.push(`element ${element.id} does not match its log entry on day ${entry.day}`);
    }
    if (!grid.inBounds(element.x, element.y)) problems.push(`element ${element.id} is outside the map`);
    if (isStructure(element.type)) {
      const k = key(element.x, element.y);
      const other = occupied.get(k);
      if (other) problems.push(`elements ${other} and ${element.id} share tile (${element.x},${element.y})`);
      occupied.set(k, element.id);
    }
    if (element.type === 'inhabitant') {
      const home = element.home ? byId.get(element.home) : undefined;
      if (!home || home.type !== 'house') problems.push(`inhabitant ${element.id} has no house`);
      else {
        if (home.day >= element.day) problems.push(`inhabitant ${element.id} moved in before house ${home.id} existed`);
        if (home.x !== element.x || home.y !== element.y) problems.push(`inhabitant ${element.id} is not at their house`);
        residents.set(home.id, (residents.get(home.id) ?? 0) + 1);
      }
      if (!element.name) problems.push(`inhabitant ${element.id} has no name`);
    }
    if (isBeing(element.type) && !element.role) problems.push(`${element.type} ${element.id} has no role`);
  }
  for (const [house, count] of residents) {
    if (count > 2) problems.push(`house ${house} has ${count} inhabitants (max 2)`);
  }

  for (const entry of world.days) {
    if (entry.action === 'genesis') continue;
    if (isTerrainAction(entry.action) !== Boolean(entry.terrain)) {
      problems.push(`day ${entry.day}: terrain change and action "${entry.action}" do not match`);
    }
    if (!isTerrainAction(entry.action) && !entry.element) problems.push(`day ${entry.day}: element reference missing`);
    if (entry.element && !byId.has(entry.element)) problems.push(`day ${entry.day}: element ${entry.element} does not exist`);
  }

  // Replay the terrain history backwards: every change must start from what was there before.
  const replay = grid.clone();
  for (let i = world.days.length - 1; i >= 0; i--) {
    const entry = world.days[i];
    if (!entry?.terrain) continue;
    if (replay.get(entry.x, entry.y) !== entry.terrain.to) {
      problems.push(`day ${entry.day}: terrain at (${entry.x},${entry.y}) is not "${entry.terrain.to}" as logged`);
    }
    replay.set(entry.x, entry.y, entry.terrain.from);
  }
  const genesisLand = replay.cellsOf((t) => t !== 'water' && t !== 'sand');
  if (genesisLand.length > 0) problems.push('the genesis island may only consist of sand');

  return problems;
}
