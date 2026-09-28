import { ACTIONS, CATALOGUE, type Action } from './catalogue';
import type { WorldContext } from './context';
import { chebyshev, type Point } from './grid';
import { pickName } from './names';
import { describePlace, type Place } from './places';
import { createRng, hashCell, hashString, type Rng } from './rng';
import { allowedRoles, allowedSpecies, candidateTiles } from './rules';

/**
 * The director keeps the story moving when nobody else decides: it weighs what the island
 * needs next (room, people, a first harbour …) and picks one legal change. It is fully
 * deterministic – the same world on the same day always gets the same suggestion.
 */

export interface Suggestion {
  action: Action;
  x: number;
  y: number;
  role?: string;
  name?: string;
  place: Place;
}

export interface ActionOption {
  action: Action;
  label: string;
  weight: number;
  tiles: number;
  suggestions: Suggestion[];
}

export function dayRng(ctx: WorldContext, day: number, salt = ''): Rng {
  return createRng(hashString(`${ctx.world.genesis}:${day}:${salt}`));
}

/** Low-frequency noise so the coastline grows in lobes and bays instead of a perfect disc. */
function coastNoise(x: number, y: number): number {
  const cx = Math.floor(x / 5);
  const cy = Math.floor(y / 5);
  return (hashCell(cx, cy, 7) % 1000) / 1000;
}

function recentActions(ctx: WorldContext, n: number): string[] {
  return ctx.world.days.slice(-n).map((d) => d.action);
}

/** How much the island "wants" each action today, before variety and chance. */
function baseNeeds(ctx: WorldContext): Record<Action, number> {
  const land = ctx.land;
  const grass = ctx.terrainCount('grass');
  const green = grass + ctx.terrainCount('forest');
  const houses = ctx.count('house');
  const residents = ctx.count('inhabitant');
  const slots = houses * 2 - residents;
  const emptyHouse = ctx.of('house').some((h) => ctx.residentsOf(h.id).length === 0);
  const targetHouses = Math.max(1, Math.floor(land / 22));
  const done = (type: Action) => ctx.world.days.some((d) => d.action === type);
  const first = (type: Action, value: number, later: number) => (done(type) ? later : value);

  return {
    land: land < 10 ? 6 : 3,
    meadow: green < land * 0.55 ? 2 : 0.5,
    rock: ctx.terrainCount('rock') === 0 && houses > 0 ? 1.2 : ctx.terrainCount('rock') < land / 30 ? 0.4 : 0.1,
    forest: ctx.count('tree') >= 4 ? 0.5 : 0.15,
    tree: ctx.count('tree') + ctx.terrainCount('forest') < grass * 0.35 ? 1.2 : 0.4,
    house:
      houses === 0
        ? land >= 14 && grass >= 4
          ? 5
          : 0
        : houses < targetHouses
          ? slots === 0
            ? 1
            : 0.5
          : 0.1,
    inhabitant: emptyHouse ? 2 : slots > 0 ? 0.6 : 0,
    path: ctx.count('path') < houses * 1.2 ? 0.6 : 0.15,
    field: ctx.count('field') < houses * 0.7 ? 0.5 : 0.15,
    garden: ctx.count('garden') < houses * 0.5 ? 0.35 : 0.1,
    well: first('well', 1.2, 0.15),
    jetty: first('jetty', 1, 0.25),
    boat: first('boat', 1, 0.3),
    harbor: 2,
    lighthouse: 2,
    library: 2,
    windmill: first('windmill', 2, 0.4),
    market: 2,
    ruin: 0.3,
    animal: !done('animal') ? 1.2 : ctx.count('animal') < land / 12 ? 0.7 : 0.2,
  };
}

function scoreTile(ctx: WorldContext, action: Action, [x, y]: Point, rng: Rng): number {
  const g = ctx.grid;
  const jitter = rng();
  const dist = ctx.distanceToCentre(x, y) / ctx.radius;
  const n8 = (test: (t: string, nx: number, ny: number) => boolean) => g.count8(x, y, test);
  const isType = (type: string) => (_: string, nx: number, ny: number) => ctx.structureAt(nx, ny)?.type === type;
  switch (action) {
    case 'land':
      return n8((t) => t !== 'water') + (g.count4(x, y, (t) => t !== 'water') >= 2 ? 1.5 : 0) - dist * 1.2 + coastNoise(x, y) * 2.5 + jitter * 1.5;
    case 'meadow':
      return n8((t) => t === 'grass' || t === 'forest') - dist * 0.8 + jitter * 1.2;
    case 'rock':
      return g.count4(x, y, (t) => t === 'rock') * 2 + (g.isCoast(x, y) ? 1 : 0) + Math.min(6, ctx.nearestDistance(x, y, 'house')) * 0.15 + jitter;
    case 'forest':
      return n8((t, nx, ny) => t === 'forest' || ctx.structureAt(nx, ny)?.type === 'tree') + jitter;
    case 'tree':
      return n8(isType('tree')) * 0.8 + dist * 0.6 - ctx.adjacent4(x, y, ['house']).length * 0.5 + jitter * 1.5;
    case 'house':
      if (ctx.count('house') === 0) return -Math.abs(dist - 0.5) + (g.get(x, y) === 'grass' ? 1 : 0) + jitter;
      return (
        (ctx.near(x, y, 2, ['house']).length > 0 ? 1 : 0) +
        ctx.adjacent4(x, y, ['path']).length * 1.5 +
        (g.get(x, y) === 'grass' ? 1 : 0) -
        dist * 0.5 +
        jitter
      );
    case 'path':
      return (
        ctx.adjacent4(x, y, ['house', 'well', 'market', 'library', 'harbor', 'windmill', 'lighthouse', 'jetty']).length * 1.2 +
        ctx.adjacent4(x, y, ['house']).filter((h) => ctx.adjacent4(h.x, h.y, ['path']).length === 0).length * 2 +
        jitter
      );
    case 'field':
      return n8(isType('field')) + ctx.near(x, y, 3, ['windmill']).length + jitter;
    case 'well':
    case 'harbor':
    case 'library':
    case 'market':
      return ctx.near(x, y, 3, ['house']).length * 0.5 + ctx.adjacent4(x, y, ['path']).length + jitter;
    case 'jetty':
      return ctx.near(x, y, 6, ['house']).length * 0.3 + jitter;
    case 'lighthouse':
      return dist * 0.5 + jitter;
    case 'windmill':
      return ctx.near(x, y, 3, ['field']).length * 0.8 + jitter;
    case 'ruin':
      return Math.min(10, ctx.nearestDistance(x, y, 'house')) * 0.3 + (g.get(x, y) === 'forest' ? 1 : 0) + jitter;
    case 'inhabitant': {
      const house = ctx.structureAt(x, y);
      return (house && ctx.residentsOf(house.id).length === 0 ? 3 : 1) + jitter;
    }
    default:
      return jitter;
  }
}

/** A trade for a newcomer: roles that just became possible come first. */
export function suggestRole(ctx: WorldContext, x: number, y: number, rng: Rng): string | undefined {
  const house = ctx.structureAt(x, y);
  if (!house) return undefined;
  const roles = allowedRoles(ctx, house);
  const present = new Set(ctx.of('inhabitant').map((e) => e.role));
  const bonus: Record<string, number> = { keeper: 5, librarian: 5, miller: 4, merchant: 3, farmer: 3, fisher: 2 };
  let best: string | undefined;
  let bestScore = -Infinity;
  for (const role of roles) {
    if (role === 'child' && ctx.count('inhabitant') < 3) continue;
    const score = (present.has(role) ? 0 : (bonus[role] ?? 1)) + rng() * 1.5;
    if (score > bestScore) {
      bestScore = score;
      best = role;
    }
  }
  return best ?? roles[0];
}

export function suggestSpecies(ctx: WorldContext, x: number, y: number, rng: Rng): string | undefined {
  const species = allowedSpecies(ctx, x, y);
  const counts = new Map<string, number>();
  for (const a of ctx.of('animal')) counts.set(a.role ?? '', (counts.get(a.role ?? '') ?? 0) + 1);
  let best: string | undefined;
  let bestScore = -Infinity;
  for (const s of species) {
    const score = (counts.get(s) ? 0 : 2) + rng() * 1.5;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

function suggestionFor(ctx: WorldContext, action: Action, tile: Point, rng: Rng): Suggestion {
  const [x, y] = tile;
  const suggestion: Suggestion = { action, x, y, place: describePlace(ctx, x, y) };
  if (action === 'inhabitant') {
    suggestion.role = suggestRole(ctx, x, y, rng);
    const taken = new Set(ctx.of('inhabitant').map((e) => e.name ?? ''));
    suggestion.name = pickName(rng, taken);
  }
  if (action === 'animal') suggestion.role = suggestSpecies(ctx, x, y, rng);
  return suggestion;
}

/** Every legal action today with its weight and the best few tiles, strongest first. */
export function options(ctx: WorldContext, day: number, perAction = 3): ActionOption[] {
  const rng = dayRng(ctx, day, 'options');
  const needs = baseNeeds(ctx);
  const recent = recentActions(ctx, 3);
  const out: ActionOption[] = [];
  for (const action of ACTIONS) {
    const tiles = candidateTiles(ctx, action);
    if (tiles.length === 0) continue;
    let weight = needs[action];
    if (weight <= 0) continue;
    const repeats = recent.filter((a) => a === action).length;
    if (recent[recent.length - 1] === action) weight *= action === 'land' ? 0.7 : 0.3;
    if (repeats >= 2) weight *= 0.4;
    if (!ctx.world.days.some((d) => d.action === action)) weight *= 1.5;
    const scored = tiles
      .map((tile) => ({ tile, score: scoreTile(ctx, action, tile, rng) }))
      .sort((a, b) => b.score - a.score || a.tile[1] - b.tile[1] || a.tile[0] - b.tile[0]);
    const suggestions = dedupeNearby(scored.map((s) => s.tile), perAction).map((tile) => suggestionFor(ctx, action, tile, rng));
    out.push({ action, label: CATALOGUE[action].label, weight: round(weight), tiles: tiles.length, suggestions });
  }
  return out.sort((a, b) => b.weight - a.weight || a.action.localeCompare(b.action));
}

/** Spread suggestions out a little so the options are real alternatives. */
function dedupeNearby(tiles: Point[], limit: number): Point[] {
  const chosen: Point[] = [];
  for (const tile of tiles) {
    if (chosen.every(([x, y]) => chebyshev(x, y, tile[0], tile[1]) > 1)) chosen.push(tile);
    if (chosen.length >= limit) break;
  }
  if (chosen.length < limit) {
    for (const tile of tiles) {
      if (!chosen.includes(tile)) chosen.push(tile);
      if (chosen.length >= limit) break;
    }
  }
  return chosen;
}

/** The director's pick for today: a weighted draw, so rare things stay possible. */
export function recommend(ctx: WorldContext, day: number): Suggestion {
  const all = options(ctx, day, 1);
  if (all.length === 0) throw new Error('No legal change is possible – the world rules need attention.');
  const rng = dayRng(ctx, day, 'recommend');
  const total = all.reduce((sum, o) => sum + o.weight, 0);
  let roll = rng() * total;
  let pick = all[all.length - 1] as ActionOption;
  for (const option of all) {
    roll -= option.weight;
    if (roll <= 0) {
      pick = option;
      break;
    }
  }
  const suggestion = pick.suggestions[0];
  if (!suggestion) throw new Error('The director found an action without a tile.');
  return suggestion;
}

const round = (n: number) => Math.round(n * 100) / 100;
