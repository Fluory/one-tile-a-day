import type { Season } from '@/features/world';
import { PALETTES, ROOFS, type ColorKey, type Palette } from './palette';
import {
  ANIMALS,
  BOAT,
  FIELDS,
  GARDENS,
  HARBOR,
  HOUSE,
  JETTY_H,
  LEGEND,
  LIBRARY,
  LIGHTHOUSE,
  MARKET,
  RUINS,
  TREES,
  WELL,
  WINDMILL,
  type Sprite,
} from './sprites';

/** The island's sprites as standalone pixel icons – used on the website for rules and chapters. */
export const ICONS = {
  house: { sprite: HOUSE, overrides: { roof0: ROOFS[0]?.[0], roof1: ROOFS[0]?.[1] } },
  tree: { sprite: TREES.oak, overrides: {} },
  pine: { sprite: TREES.pine, overrides: {} },
  lighthouse: { sprite: LIGHTHOUSE, overrides: {} },
  windmill: { sprite: WINDMILL.slice(4), overrides: {} },
  library: { sprite: LIBRARY, overrides: { roof0: '#4a3f6b', roof1: '#6a5a9a' } },
  market: { sprite: MARKET, overrides: {} },
  harbor: { sprite: HARBOR, overrides: {} },
  well: { sprite: WELL, overrides: { roof0: '#6d4a2f', roof1: '#946842' } },
  field: { sprite: FIELDS[0] ?? [], overrides: {} },
  garden: { sprite: GARDENS[0] ?? [], overrides: {} },
  ruin: { sprite: RUINS[0] ?? [], overrides: {} },
  boat: { sprite: BOAT, overrides: {} },
  jetty: { sprite: JETTY_H, overrides: {} },
  sheep: { sprite: ANIMALS.sheep ?? [], overrides: { fur0: '#f3efe6', fur1: '#2b2a2e' } },
} satisfies Record<string, { sprite: Sprite; overrides: Partial<Record<ColorKey, string | undefined>> }>;

export type IconName = keyof typeof ICONS;

export interface PixelIconData {
  width: number;
  height: number;
  pixels: [x: number, y: number, color: string][];
}

export function pixelIcon(name: IconName, season: Season = 'summer'): PixelIconData {
  const { sprite, overrides } = ICONS[name];
  const palette: Palette = PALETTES[season];
  const pixels: [number, number, string][] = [];
  let width = 0;
  sprite.forEach((row, y) => {
    width = Math.max(width, row.length);
    for (let x = 0; x < row.length; x++) {
      const ch = row[x] as string;
      if (ch === '.' || ch === 'S') continue;
      const key = LEGEND[ch];
      if (!key) continue;
      const color = (overrides as Partial<Record<ColorKey, string | undefined>>)[key] ?? palette[key];
      pixels.push([x, y, color]);
    }
  });
  return { width, height: sprite.length, pixels };
}
