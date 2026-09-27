import { z } from 'zod';

/**
 * The world model. `world/world.json` is the single source of truth – everything visible
 * (isle.svg, LOGBOOK.md, RULES.md, the website) is derived from it.
 *
 * Terrain is stored as ASCII rows so that a daily commit shows the change as a one-character
 * diff you can literally see in the map.
 */

export const TERRAIN_CHARS = {
  water: '~',
  sand: '.',
  grass: ',',
  rock: '^',
  forest: '*',
} as const;

export type Terrain = keyof typeof TERRAIN_CHARS;
export const TERRAINS = Object.keys(TERRAIN_CHARS) as Terrain[];

const CHAR_TO_TERRAIN = new Map<string, Terrain>(
  TERRAINS.map((terrain) => [TERRAIN_CHARS[terrain], terrain]),
);

export function terrainFromChar(char: string): Terrain {
  const terrain = CHAR_TO_TERRAIN.get(char);
  if (!terrain) throw new Error(`Unknown terrain character "${char}"`);
  return terrain;
}

/** Day actions that change the ground itself ("Landstück"). */
export const TERRAIN_ACTIONS = ['land', 'meadow', 'rock', 'forest'] as const;
export type TerrainAction = (typeof TERRAIN_ACTIONS)[number];

/** Things that stand on a tile and occupy it exclusively. */
export const STRUCTURE_TYPES = [
  'tree',
  'house',
  'path',
  'field',
  'garden',
  'well',
  'jetty',
  'boat',
  'harbor',
  'lighthouse',
  'library',
  'windmill',
  'market',
  'ruin',
] as const;
export type StructureType = (typeof STRUCTURE_TYPES)[number];

/** Living things – they are anchored to a tile but do not block it. */
export const BEING_TYPES = ['inhabitant', 'animal'] as const;
export type BeingType = (typeof BEING_TYPES)[number];

export type ElementType = StructureType | BeingType;
export const ELEMENT_TYPES: readonly ElementType[] = [...STRUCTURE_TYPES, ...BEING_TYPES];

export type DayAction = TerrainAction | ElementType | 'genesis';
export const DAY_ACTIONS: readonly DayAction[] = ['genesis', ...TERRAIN_ACTIONS, ...ELEMENT_TYPES];

export function isStructure(type: string): type is StructureType {
  return (STRUCTURE_TYPES as readonly string[]).includes(type);
}

export function isBeing(type: string): type is BeingType {
  return (BEING_TYPES as readonly string[]).includes(type);
}

export function isTerrainAction(action: string): action is TerrainAction {
  return (TERRAIN_ACTIONS as readonly string[]).includes(action);
}

const terrainEnum = z.enum(TERRAINS as [Terrain, ...Terrain[]]);
const coord = z.number().int().min(0).max(255);

export const elementSchema = z.object({
  id: z.string().regex(/^e\d+$/),
  day: z.number().int().min(0),
  type: z.enum(ELEMENT_TYPES as [ElementType, ...ElementType[]]),
  x: coord,
  y: coord,
  variant: z.number().int().min(0).max(15),
  name: z.string().min(1).max(24).optional(),
  role: z.string().min(1).max(24).optional(),
  home: z.string().regex(/^e\d+$/).optional(),
});
export type Element = z.infer<typeof elementSchema>;

export const daySchema = z.object({
  day: z.number().int().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  action: z.enum(DAY_ACTIONS as [DayAction, ...DayAction[]]),
  x: coord,
  y: coord,
  title: z.string().min(3).max(80),
  lore: z.string().min(3).max(200),
  source: z.enum(['genesis', 'claude', 'director']),
  terrain: z.object({ from: terrainEnum, to: terrainEnum }).optional(),
  element: z.string().regex(/^e\d+$/).optional(),
});
export type DayEntry = z.infer<typeof daySchema>;

export const worldSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1),
  genesis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  width: z.number().int().min(8).max(256),
  height: z.number().int().min(8).max(256),
  terrain: z.array(z.string()),
  elements: z.array(elementSchema),
  days: z.array(daySchema).min(1),
});
export type World = z.infer<typeof worldSchema>;

export function parseWorld(input: unknown): World {
  return worldSchema.parse(input);
}
