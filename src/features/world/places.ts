import type { WorldContext } from './context';
import { chebyshev } from './grid';
import type { ElementType } from './schema';

const DIRECTIONS = ['east', 'north-east', 'north', 'north-west', 'west', 'south-west', 'south', 'south-east'] as const;
const ADJECTIVES = [
  'eastern',
  'north-eastern',
  'northern',
  'north-western',
  'western',
  'south-western',
  'southern',
  'south-eastern',
] as const;

const LANDMARKS: readonly [ElementType, string][] = [
  ['lighthouse', 'the lighthouse'],
  ['library', 'the library'],
  ['harbor', 'the harbour'],
  ['market', 'the market'],
  ['windmill', 'the windmill'],
  ['well', 'the well'],
  ['ruin', 'the old ruins'],
];

export interface Place {
  /** Phrase with preposition: "on the north shore". */
  at: string;
  /** Bare name: "the north shore". */
  name: string;
  /** Compass direction from the island's centre, or "centre". */
  direction: (typeof DIRECTIONS)[number] | 'centre';
}

function sector(ctx: WorldContext, x: number, y: number): number {
  const angle = Math.atan2(-(y - ctx.centroid.y), x - ctx.centroid.x);
  return (Math.round(angle / (Math.PI / 4)) + 8) % 8;
}

/** Describe a tile in words, as seen before today's change. */
export function describePlace(ctx: WorldContext, x: number, y: number): Place {
  const g = ctx.grid;
  const t = g.get(x, y);
  const s = sector(ctx, x, y);
  const direction = DIRECTIONS[s] ?? 'north';
  const adjective = ADJECTIVES[s] ?? 'northern';

  if (t === 'water') {
    const name = `the ${direction} coast`;
    return { at: `off ${name}`, name, direction };
  }

  let landmark: { name: string; dist: number } | undefined;
  for (const [type, label] of LANDMARKS) {
    for (const e of ctx.of(type)) {
      const dist = chebyshev(x, y, e.x, e.y);
      if (dist > 0 && dist <= 2 && (!landmark || dist < landmark.dist)) landmark = { name: label, dist };
    }
  }
  if (landmark) return { at: `by ${landmark.name}`, name: landmark.name, direction };

  if (ctx.land >= 12 && ctx.distanceToCentre(x, y) < ctx.radius * 0.35) {
    return { at: 'in the heart of the island', name: 'the heart of the island', direction: 'centre' };
  }

  switch (t) {
    case 'sand':
      if (g.isCoast(x, y)) {
        const name = `the ${direction} shore`;
        return { at: `on ${name}`, name, direction };
      }
      return { at: `on the ${adjective} dunes`, name: `the ${adjective} dunes`, direction };
    case 'grass':
      return { at: `in the ${adjective} meadows`, name: `the ${adjective} meadows`, direction };
    case 'forest':
      return { at: `in the ${adjective} woods`, name: `the ${adjective} woods`, direction };
    case 'rock':
      return { at: `on the ${adjective} rocks`, name: `the ${adjective} rocks`, direction };
    default:
      return { at: 'somewhere on the island', name: 'the island', direction };
  }
}
