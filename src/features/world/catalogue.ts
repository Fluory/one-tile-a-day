import type { ElementType, TerrainAction } from './schema';

export type Action = TerrainAction | ElementType;

export interface ActionInfo {
  label: string;
  /** Plural label for statistics. */
  plural: string;
  emoji: string;
  category: 'ground' | 'structure' | 'life';
  /** One sentence for RULES.md – the human-readable version of the rule in rules.ts. */
  rule: string;
  /** Number of sprite variants the renderer knows for this type. */
  variants: number;
}

/**
 * Everything the island knows how to grow. The order is the order of RULES.md.
 * Placement logic lives in rules.ts, narrative weighting in director.ts.
 */
export const CATALOGUE: Record<Action, ActionInfo> = {
  land: {
    label: 'Land',
    plural: 'tiles of land',
    emoji: '🏝️',
    category: 'ground',
    rule: 'Sand rises from open water that touches the island on at least one side, never closer than two tiles to the edge of the map.',
    variants: 1,
  },
  meadow: {
    label: 'Meadow',
    plural: 'meadows',
    emoji: '🌿',
    category: 'ground',
    rule: 'Sand turns to grass only inland (no open water on any side) and only next to existing grass – the very first meadow needs sand on all four sides.',
    variants: 1,
  },
  rock: {
    label: 'Rocks',
    plural: 'rocks',
    emoji: '🪨',
    category: 'ground',
    rule: 'Rock breaks through bare sand or grass on the coast, or grows inland from rock that is already there. At most one rock per twelve tiles of land.',
    variants: 1,
  },
  forest: {
    label: 'Forest',
    plural: 'forest tiles',
    emoji: '🌲',
    category: 'ground',
    rule: 'Bare grass becomes forest when at least two trees or forest tiles surround it. Forest may cover at most a quarter of the land.',
    variants: 1,
  },
  tree: {
    label: 'Tree',
    plural: 'trees',
    emoji: '🌳',
    category: 'structure',
    rule: 'A tree needs a free grass tile.',
    variants: 4,
  },
  house: {
    label: 'House',
    plural: 'houses',
    emoji: '🏠',
    category: 'structure',
    rule: 'A house needs a free grass or sand tile with land on at least three sides and no other house directly next to it. Every house after the first stands at most three tiles from a house or path.',
    variants: 3,
  },
  path: {
    label: 'Path',
    plural: 'path tiles',
    emoji: '🛤️',
    category: 'structure',
    rule: 'Paths appear once there are two houses. A path tile must touch a house, a path or a public building, and paths never form a 2×2 square.',
    variants: 1,
  },
  field: {
    label: 'Field',
    plural: 'fields',
    emoji: '🌾',
    category: 'structure',
    rule: 'A field needs a free grass tile at most three tiles from a house and two inhabitants to work it. At most two fields per house.',
    variants: 2,
  },
  garden: {
    label: 'Garden',
    plural: 'gardens',
    emoji: '🌷',
    category: 'structure',
    rule: 'A garden sits on free grass directly next to a house. One garden per house.',
    variants: 3,
  },
  well: {
    label: 'Well',
    plural: 'wells',
    emoji: '🪣',
    category: 'structure',
    rule: 'A well needs two houses, a spot at most two tiles from a house and no other well within five tiles.',
    variants: 1,
  },
  jetty: {
    label: 'Jetty',
    plural: 'jetties',
    emoji: '🪵',
    category: 'structure',
    rule: 'A jetty is built into the water next to a sandy shore, with a house at most six tiles away. At most three jetties.',
    variants: 2,
  },
  boat: {
    label: 'Boat',
    plural: 'boats',
    emoji: '⛵',
    category: 'structure',
    rule: 'A boat needs someone to sail it and moors in open water next to a jetty or the harbour. One boat per jetty or harbour.',
    variants: 3,
  },
  harbor: {
    label: 'Harbour',
    plural: 'harbours',
    emoji: '⚓',
    category: 'structure',
    rule: 'The harbour needs a sandy coast tile, three houses and a jetty within three tiles. There is only one.',
    variants: 1,
  },
  lighthouse: {
    label: 'Lighthouse',
    plural: 'lighthouses',
    emoji: '🗼',
    category: 'structure',
    rule: 'The lighthouse needs rock on the coast and at least one house for its keeper. There is only one.',
    variants: 1,
  },
  library: {
    label: 'Library',
    plural: 'libraries',
    emoji: '📚',
    category: 'structure',
    rule: 'The library needs at least three houses and free grass directly next to a path. There is only one.',
    variants: 1,
  },
  windmill: {
    label: 'Windmill',
    plural: 'windmills',
    emoji: '🌬️',
    category: 'structure',
    rule: 'A windmill needs free grass with two fields within three tiles. At most two.',
    variants: 1,
  },
  market: {
    label: 'Market',
    plural: 'markets',
    emoji: '🏪',
    category: 'structure',
    rule: 'The market needs five houses and a free tile touching at least two path tiles. There is only one.',
    variants: 1,
  },
  ruin: {
    label: 'Ruin',
    plural: 'ruins',
    emoji: '🏛️',
    category: 'structure',
    rule: 'Ruins of an older time surface on forest, rock or grass at least five tiles from any house, once the island has thirty tiles of land. At most two.',
    variants: 2,
  },
  inhabitant: {
    label: 'Inhabitant',
    plural: 'inhabitants',
    emoji: '🧑',
    category: 'life',
    rule: 'An inhabitant moves into a house with room (two per house). Their trade must fit the island: a keeper needs the lighthouse, a farmer a field, a fisher a jetty, boat, harbour or a house on the beach.',
    variants: 4,
  },
  animal: {
    label: 'Animal',
    plural: 'animals',
    emoji: '🐑',
    category: 'life',
    rule: 'An animal needs a free tile of the ground it likes (sheep on grass, goats near rock, foxes and deer in the forest, gulls and crabs on the beach, cats and dogs near a house). At most one animal per eight tiles of land.',
    variants: 1,
  },
};

export const ACTIONS = Object.keys(CATALOGUE) as Action[];

export function isAction(value: string): value is Action {
  return value in CATALOGUE;
}

/** Trades an inhabitant can have, with the rule that unlocks them. */
export const ROLES = [
  'fisher',
  'farmer',
  'keeper',
  'librarian',
  'miller',
  'baker',
  'carpenter',
  'weaver',
  'healer',
  'merchant',
  'boatbuilder',
  'storyteller',
  'child',
] as const;
export type Role = (typeof ROLES)[number];

export const SPECIES = ['sheep', 'goat', 'cat', 'dog', 'fox', 'deer', 'rabbit', 'gull', 'crab'] as const;
export type Species = (typeof SPECIES)[number];

export const TREE_KINDS = ['oak', 'pine', 'birch', 'apple tree'] as const;
