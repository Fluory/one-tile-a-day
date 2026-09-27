import { CATALOGUE, type Action } from './catalogue';
import { daysBetween, isIsoDate } from './calendar';
import { WorldContext } from './context';
import { dayRng, suggestRole, suggestSpecies } from './director';
import { Grid } from './grid';
import { autoLore, autoTitle, checkText } from './lore';
import { isValidName, pickName } from './names';
import { describePlace } from './places';
import { hashCell } from './rng';
import { checkPlacement } from './rules';
import { isTerrainAction, type DayEntry, type Element, type Terrain, type World } from './schema';

/** What the routine (or the director) decided for one day. */
export interface DayChoice {
  action: Action;
  x: number;
  y: number;
  role?: string;
  name?: string;
  variant?: number;
  title?: string;
  lore?: string;
  source: 'claude' | 'director';
}

export class WorldRuleError extends Error {}

const TERRAIN_RESULT: Record<string, Terrain> = {
  land: 'sand',
  meadow: 'grass',
  rock: 'rock',
  forest: 'forest',
};

export const GENESIS_TITLE = 'A sandbank in the open sea';
export const GENESIS_LORE = 'Nothing but water – and in the middle of it, a small sandbank. Tomorrow, the island begins.';

/** Day 0: open sea with a small sandbank in the middle of the map. */
export function createGenesis(date: string, name = 'One Tile a Day', size = 64): World {
  if (!isIsoDate(date)) throw new WorldRuleError(`invalid genesis date "${date}"`);
  const grid = Grid.filled(size, size, 'water');
  const cx = Math.floor(size / 2) - 1;
  const cy = Math.floor(size / 2);
  const bank: [number, number][] = [
    [cx, cy - 1],
    [cx + 1, cy - 1],
    [cx - 1, cy],
    [cx, cy],
    [cx + 1, cy],
    [cx + 2, cy],
    [cx, cy + 1],
    [cx + 1, cy + 1],
  ];
  for (const [x, y] of bank) grid.set(x, y, 'sand');
  return {
    version: 1,
    name,
    genesis: date,
    width: size,
    height: size,
    terrain: grid.toRows(),
    elements: [],
    days: [
      {
        day: 0,
        date,
        action: 'genesis',
        x: cx,
        y: cy,
        title: GENESIS_TITLE,
        lore: GENESIS_LORE,
        source: 'genesis',
      },
    ],
  };
}

function nextElementId(world: World): string {
  const max = world.elements.reduce((m, e) => Math.max(m, Number(e.id.slice(1))), 0);
  return `e${max + 1}`;
}

/**
 * Apply exactly one change for `date`. Pure: returns a new world and never mutates the input.
 * Throws WorldRuleError when the change breaks a rule – the world stays untouched then.
 */
export function applyDay(world: World, choice: DayChoice, date: string): { world: World; entry: DayEntry } {
  if (!isIsoDate(date)) throw new WorldRuleError(`invalid date "${date}"`);
  const last = world.days[world.days.length - 1];
  if (!last) throw new WorldRuleError('world has no genesis day');
  const day = daysBetween(world.genesis, date);
  if (date <= last.date || day <= last.day) {
    throw new WorldRuleError(`day ${day} (${date}) is not after the last recorded day ${last.day} (${last.date})`);
  }

  const ctx = new WorldContext(world);
  const { action, x, y } = choice;
  const rng = dayRng(ctx, day, 'apply');

  let role = choice.role?.trim().toLowerCase() || undefined;
  if (role && action !== 'inhabitant' && action !== 'animal') {
    throw new WorldRuleError('only inhabitants (trade) and animals (species) take a role');
  }
  if (action === 'inhabitant') role ??= suggestRole(ctx, x, y, rng);
  if (action === 'animal') role ??= suggestSpecies(ctx, x, y, rng);

  const reason = checkPlacement(ctx, { action, x, y, role });
  if (reason) throw new WorldRuleError(`${CATALOGUE[action]?.label ?? action} at (${x},${y}): ${reason}`);

  let name: string | undefined;
  if (action === 'inhabitant') {
    const taken = new Set(ctx.of('inhabitant').map((e) => e.name ?? ''));
    name = choice.name?.trim() || pickName(rng, taken);
    if (!isValidName(name)) throw new WorldRuleError(`"${name}" is not a valid name (letters, spaces, apostrophes; 2–24 characters)`);
    if (taken.has(name)) throw new WorldRuleError(`somebody called ${name} already lives on the island`);
  } else if (choice.name) {
    throw new WorldRuleError('only inhabitants carry a name');
  }

  const variants = CATALOGUE[action].variants;
  const variant = choice.variant ?? hashCell(x, y, day) % variants;
  if (!Number.isInteger(variant) || variant < 0 || variant >= variants) {
    throw new WorldRuleError(`variant must be between 0 and ${variants - 1}`);
  }

  const place = describePlace(ctx, x, y);
  const house = action === 'inhabitant' ? ctx.structureAt(x, y) : undefined;
  const loreInput = { action, place, variant, name, role, homePlace: house ? place : undefined };
  const title = choice.title?.trim() || autoTitle(loreInput);
  const lore = choice.lore?.trim() || autoLore(loreInput);
  for (const [kind, text] of [
    ['title', title],
    ['lore', lore],
  ] as const) {
    const problem = checkText(kind, text);
    if (problem) throw new WorldRuleError(problem);
  }

  const entry: DayEntry = { day, date, action, x, y, title, lore, source: choice.source };
  let terrain = world.terrain;
  let elements = world.elements;

  if (isTerrainAction(action)) {
    const grid = ctx.grid.clone();
    const from = grid.get(x, y) as Terrain;
    const to = TERRAIN_RESULT[action] as Terrain;
    grid.set(x, y, to);
    terrain = grid.toRows();
    entry.terrain = { from, to };
  } else {
    const element: Element = { id: nextElementId(world), day, type: action, x, y, variant };
    if (name) element.name = name;
    if (role) element.role = role;
    if (house) element.home = house.id;
    elements = [...world.elements, element];
    entry.element = element.id;
  }

  return { world: { ...world, terrain, elements, days: [...world.days, entry] }, entry };
}
