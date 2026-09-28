import { CATALOGUE, ROLES, SPECIES, type Action, type Role, type Species } from './catalogue';
import type { WorldContext } from './context';
import type { Point } from './grid';
import type { Element, ElementType } from './schema';

/**
 * The world rules. Every day's change must pass `checkPlacement` – the routine (and Claude)
 * can only choose among what these functions allow. RULES.md is generated from CATALOGUE,
 * so the sentence there and the code here must describe the same thing.
 */

export interface Placement {
  action: Action;
  x: number;
  y: number;
  /** Trade of an inhabitant or species of an animal. */
  role?: string;
}

/** Map edge that stays open sea, so the island never touches the border. */
export const MAP_MARGIN = 2;

const PUBLIC_BUILDINGS: readonly ElementType[] = [
  'house',
  'path',
  'well',
  'market',
  'library',
  'harbor',
  'windmill',
  'lighthouse',
  'jetty',
];

const ROLE_LIMITS: Partial<Record<Role, number>> = {
  keeper: 1,
  librarian: 1,
  healer: 1,
  boatbuilder: 1,
  storyteller: 2,
  carpenter: 2,
  weaver: 2,
  merchant: 2,
};

const SPECIES_LIMITS: Record<Species, number> = {
  sheep: 6,
  goat: 3,
  cat: 3,
  dog: 3,
  fox: 2,
  deer: 3,
  rabbit: 4,
  gull: 4,
  crab: 3,
};

function withinMargin(ctx: WorldContext, x: number, y: number): boolean {
  const { width, height } = ctx.world;
  return x >= MAP_MARGIN && y >= MAP_MARGIN && x < width - MAP_MARGIN && y < height - MAP_MARGIN;
}

function roleCount(ctx: WorldContext, role: Role): number {
  return ctx.of('inhabitant').filter((e) => e.role === role).length;
}

/** Trades available for a new resident of `house`. */
export function allowedRoles(ctx: WorldContext, house: Element): Role[] {
  const houses = ctx.count('house');
  const has = (type: ElementType) => ctx.count(type) > 0;
  const residents = ctx.residentsOf(house.id);
  const houseTerrain = ctx.grid.get(house.x, house.y);
  const checks: Record<Role, boolean> = {
    fisher:
      (has('jetty') || has('boat') || has('harbor') || houseTerrain === 'sand') &&
      roleCount(ctx, 'fisher') < 1 + ctx.count('jetty') + ctx.count('boat') + ctx.count('harbor') * 2,
    farmer: has('field') && roleCount(ctx, 'farmer') < ctx.count('field') + 1,
    keeper: has('lighthouse'),
    librarian: has('library'),
    miller: ctx.count('windmill') > roleCount(ctx, 'miller'),
    baker: houses >= 3 && roleCount(ctx, 'baker') < 1 + Math.floor(houses / 6),
    carpenter: true,
    weaver: houses >= 2,
    healer: houses >= 4,
    merchant: has('market'),
    boatbuilder: has('jetty'),
    storyteller: true,
    child: residents.some((r) => r.role !== 'child'),
  };
  return ROLES.filter((role) => {
    if (!checks[role]) return false;
    const limit = ROLE_LIMITS[role];
    return limit === undefined || roleCount(ctx, role) < limit;
  });
}

/** Species that may settle on (x, y). */
export function allowedSpecies(ctx: WorldContext, x: number, y: number): Species[] {
  const g = ctx.grid;
  const t = g.get(x, y);
  if (t === undefined || t === 'water' || !ctx.isFree(x, y) || ctx.animalAt(x, y)) return [];
  const nextTo = (terrain: string) => g.count4(x, y, (n) => n === terrain) > 0;
  const nearHouse = ctx.near(x, y, 2, ['house']).length > 0;
  const coastSand = t === 'sand' && g.isCoast(x, y);
  const checks: Record<Species, boolean> = {
    sheep: t === 'grass' && (ctx.count('field') > 0 || ctx.terrainCount('grass') >= 10),
    goat: t === 'rock' || ((t === 'grass' || t === 'sand') && nextTo('rock')),
    cat: (t === 'grass' || t === 'sand') && nearHouse,
    dog: (t === 'grass' || t === 'sand') && nearHouse,
    fox: t === 'forest' || (t === 'grass' && nextTo('forest')),
    deer: t === 'forest' && ctx.terrainCount('forest') >= 3,
    rabbit: t === 'grass',
    gull: coastSand,
    crab: coastSand,
  };
  const counts = new Map<string, number>();
  for (const a of ctx.of('animal')) counts.set(a.role ?? '', (counts.get(a.role ?? '') ?? 0) + 1);
  return SPECIES.filter((s) => checks[s] && (counts.get(s) ?? 0) < SPECIES_LIMITS[s]);
}

function animalCapacity(ctx: WorldContext): number {
  return Math.floor(ctx.land / 8);
}

function wouldCloseSquare(ctx: WorldContext, x: number, y: number, type: ElementType): boolean {
  const is = (px: number, py: number) => ctx.structureAt(px, py)?.type === type;
  const corners: [number, number][] = [
    [-1, -1],
    [0, -1],
    [-1, 0],
    [0, 0],
  ];
  return corners.some(([ox, oy]) => {
    const cells: [number, number][] = [
      [x + ox, y + oy],
      [x + ox + 1, y + oy],
      [x + ox, y + oy + 1],
      [x + ox + 1, y + oy + 1],
    ];
    return cells.every(([cx, cy]) => (cx === x && cy === y) || is(cx, cy));
  });
}

/** `null` when the placement is legal, otherwise a short human-readable reason. */
export function checkPlacement(ctx: WorldContext, p: Placement): string | null {
  const { action, x, y } = p;
  const g = ctx.grid;
  if (!(action in CATALOGUE)) return `unknown action "${action}"`;
  if (!g.inBounds(x, y)) return `(${x},${y}) is outside the map`;
  const t = g.get(x, y);
  const free = ctx.isFree(x, y);
  const houses = ctx.count('house');

  switch (action) {
    case 'land':
      if (t !== 'water') return 'land can only rise from water';
      if (!free) return 'something is moored here';
      if (!withinMargin(ctx, x, y)) return 'too close to the edge of the map';
      if (g.count4(x, y, (n) => n !== 'water') === 0) return 'new land must touch the island';
      return null;
    case 'meadow': {
      if (t !== 'sand') return 'only sand can turn into a meadow';
      if (!free) return 'the tile is occupied';
      if (g.isCoast(x, y)) return 'the coast stays sandy';
      const firstMeadow = ctx.terrainCount('grass') + ctx.terrainCount('forest') === 0;
      if (!firstMeadow && g.count4(x, y, (n) => n === 'grass' || n === 'forest') === 0)
        return 'grass spreads from existing grass';
      return null;
    }
    case 'rock':
      if (t !== 'sand' && t !== 'grass') return 'rock breaks through sand or grass';
      if (!free || ctx.animalAt(x, y)) return 'the tile is occupied';
      if (!g.isCoast(x, y) && g.count4(x, y, (n) => n === 'rock') === 0) return 'rock rises on the coast or next to rock';
      if (ctx.terrainCount('rock') >= Math.max(1, Math.floor(ctx.land / 12))) return 'the island has enough rock for now';
      return null;
    case 'forest':
      if (t !== 'grass') return 'forest grows on grass';
      if (!free) return 'the tile is occupied';
      if (ctx.terrainCount('forest') + 1 > Math.floor(ctx.land / 4)) return 'forest may cover at most a quarter of the land';
      if (g.count8(x, y, (n, nx, ny) => n === 'forest' || ctx.structureAt(nx, ny)?.type === 'tree') < 2)
        return 'a forest needs two trees or forest tiles around it';
      return null;
    case 'tree':
      if (t !== 'grass') return 'trees grow on grass';
      if (!free) return 'the tile is occupied';
      return null;
    case 'house':
      if (t !== 'grass' && t !== 'sand') return 'houses stand on grass or sand';
      if (!free) return 'the tile is occupied';
      if (g.count4(x, y, (n) => n !== 'water') < 3) return 'a house needs land on at least three sides';
      if (ctx.adjacent4(x, y, ['house']).length > 0) return 'houses keep a tile of space between them';
      if (houses > 0 && ctx.near(x, y, 3, ['house', 'path']).length === 0)
        return 'new houses stay within three tiles of the village';
      return null;
    case 'path':
      if (t !== 'grass' && t !== 'sand') return 'paths run over grass or sand';
      if (!free) return 'the tile is occupied';
      if (houses < 2) return 'paths appear once there are two houses';
      if (ctx.adjacent4(x, y, PUBLIC_BUILDINGS).length === 0) return 'a path must connect to a house, path or public building';
      if (wouldCloseSquare(ctx, x, y, 'path')) return 'paths never form a 2×2 square';
      return null;
    case 'field':
      if (t !== 'grass') return 'fields need grass';
      if (!free) return 'the tile is occupied';
      if (ctx.count('inhabitant') < 2) return 'a field needs two inhabitants to work it';
      if (ctx.near(x, y, 3, ['house']).length === 0) return 'fields lie at most three tiles from a house';
      if (ctx.count('field') >= houses * 2) return 'at most two fields per house';
      return null;
    case 'garden': {
      if (t !== 'grass') return 'gardens need grass';
      if (!free) return 'the tile is occupied';
      const neighbours = ctx.adjacent4(x, y, ['house']);
      if (neighbours.length === 0) return 'a garden sits directly next to a house';
      const withoutGarden = neighbours.filter((h) => ctx.adjacent4(h.x, h.y, ['garden']).length === 0);
      if (withoutGarden.length === 0) return 'that house already has a garden';
      return null;
    }
    case 'well':
      if (t !== 'grass' && t !== 'sand') return 'wells are dug in grass or sand';
      if (!free) return 'the tile is occupied';
      if (houses < 2) return 'a well needs two houses';
      if (ctx.near(x, y, 2, ['house']).length === 0) return 'a well lies at most two tiles from a house';
      if (ctx.near(x, y, 5, ['well']).length > 0) return 'another well is within five tiles';
      return null;
    case 'jetty':
      if (t !== 'water') return 'jetties are built into the water';
      if (!free) return 'the tile is occupied';
      if (g.count4(x, y, (n) => n === 'sand') === 0) return 'a jetty starts from a sandy shore';
      if (ctx.near(x, y, 6, ['house']).length === 0) return 'a jetty needs a house within six tiles';
      if (ctx.count('jetty') >= 3) return 'at most three jetties';
      if (ctx.adjacent4(x, y, ['jetty', 'boat']).length > 0) return 'too close to another jetty or boat';
      return null;
    case 'boat':
      if (t !== 'water') return 'boats float on water';
      if (!free) return 'the tile is occupied';
      if (ctx.count('inhabitant') === 0) return 'a boat needs someone to sail it';
      if (ctx.adjacent4(x, y, ['jetty', 'harbor']).length === 0) return 'a boat moors next to a jetty or the harbour';
      if (ctx.count('boat') >= ctx.count('jetty') + ctx.count('harbor')) return 'one boat per jetty or harbour';
      return null;
    case 'harbor':
      if (t !== 'sand' || !g.isCoast(x, y)) return 'the harbour needs a sandy coast tile';
      if (!free) return 'the tile is occupied';
      if (houses < 3) return 'the harbour needs three houses';
      if (ctx.near(x, y, 3, ['jetty']).length === 0) return 'the harbour needs a jetty within three tiles';
      if (ctx.count('harbor') >= 1) return 'there is already a harbour';
      return null;
    case 'lighthouse':
      if (t !== 'rock' || !g.isCoast(x, y)) return 'the lighthouse needs rock on the coast';
      if (!free) return 'the tile is occupied';
      if (houses < 1) return 'the lighthouse needs a house for its keeper';
      if (ctx.count('lighthouse') >= 1) return 'there is already a lighthouse';
      return null;
    case 'library':
      if (t !== 'grass') return 'the library needs grass';
      if (!free) return 'the tile is occupied';
      if (houses < 3) return 'the library needs three houses';
      if (ctx.adjacent4(x, y, ['path']).length === 0) return 'the library stands directly next to a path';
      if (ctx.count('library') >= 1) return 'there is already a library';
      return null;
    case 'windmill':
      if (t !== 'grass') return 'windmills need grass';
      if (!free) return 'the tile is occupied';
      if (ctx.near(x, y, 3, ['field']).length < 2) return 'a windmill needs two fields within three tiles';
      if (ctx.count('windmill') >= 2) return 'at most two windmills';
      return null;
    case 'market':
      if (t !== 'grass' && t !== 'sand') return 'the market needs grass or sand';
      if (!free) return 'the tile is occupied';
      if (houses < 5) return 'the market needs five houses';
      if (ctx.adjacent4(x, y, ['path']).length < 2) return 'the market needs two path tiles next to it';
      if (ctx.count('market') >= 1) return 'there is already a market';
      return null;
    case 'ruin':
      if (t !== 'forest' && t !== 'rock' && t !== 'grass') return 'ruins surface on forest, rock or grass';
      if (!free) return 'the tile is occupied';
      if (ctx.land < 30) return 'ruins appear once the island has thirty tiles of land';
      if (ctx.nearestDistance(x, y, 'house') < 5) return 'ruins lie at least five tiles from any house';
      if (ctx.count('ruin') >= 2) return 'at most two ruins';
      return null;
    case 'inhabitant': {
      const house = ctx.structureAt(x, y);
      if (house?.type !== 'house') return 'an inhabitant moves into a house';
      if (ctx.residentsOf(house.id).length >= 2) return 'that house is full';
      const roles = allowedRoles(ctx, house);
      if (roles.length === 0) return 'no trade fits this house yet';
      if (p.role !== undefined && !roles.includes(p.role as Role))
        return `a ${p.role} does not fit here yet (possible: ${roles.join(', ')})`;
      return null;
    }
    case 'animal': {
      if (ctx.count('animal') >= animalCapacity(ctx)) return 'the island cannot feed another animal yet';
      const species = allowedSpecies(ctx, x, y);
      if (species.length === 0) return 'no animal would settle here';
      if (p.role !== undefined && !species.includes(p.role as Species))
        return `a ${p.role} would not settle here (possible: ${species.join(', ')})`;
      return null;
    }
  }
  return `unknown action "${String(action)}"`;
}

/** All tiles where `action` is legal today. */
export function candidateTiles(ctx: WorldContext, action: Action): Point[] {
  const out: Point[] = [];
  const { width, height } = ctx.world;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (checkPlacement(ctx, { action, x, y }) === null) out.push([x, y]);
    }
  }
  return out;
}
