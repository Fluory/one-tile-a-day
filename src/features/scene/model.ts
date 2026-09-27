import { PALETTES, type Palette } from '@/features/render';
import { addDays, seasonOf, type Season, type Terrain, type World } from '@/features/world';

/**
 * Turns the world into low-poly building blocks for the 3D island. Everything here is
 * plain data (no three.js), so it is cheap to rebuild and easy to test. Each block knows
 * the day it appeared – the scene uses that to let the island grow when the day changes.
 */

export type GeoKey = 'box' | 'cyl' | 'cone8' | 'cone4' | 'ico' | 'prism';

export interface Block {
  geo: GeoKey;
  color: string;
  /** Centre of the block in world units (tile = 1). */
  pos: [number, number, number];
  scale: [number, number, number];
  rotY?: number;
  /** Day on which the block appears. */
  from: number;
  /** Glows at night (windows, lamps). */
  glow?: boolean;
}

export interface TileState {
  day: number;
  terrain: Terrain;
}

export interface TileHistory {
  x: number;
  y: number;
  /** Chronological states; the first is the day the tile rose from the sea. */
  states: TileState[];
}

export interface Animated {
  kind: 'blades' | 'boat' | 'beam' | 'gull';
  x: number;
  y: number;
  from: number;
  color?: string;
  height: number;
}

export const HEIGHT: Record<Terrain, number> = {
  water: 0,
  sand: 0.26,
  grass: 0.42,
  forest: 0.42,
  rock: 0.72,
};

/** Terrain history per land tile, reconstructed from the day log. */
export function tileHistories(world: World): TileHistory[] {
  const changes = new Map<string, TileState[]>();
  for (const entry of world.days) {
    if (!entry.terrain) continue;
    const key = `${entry.x},${entry.y}`;
    const list = changes.get(key) ?? [];
    list.push({ day: entry.day, terrain: entry.terrain.to });
    changes.set(key, list);
  }
  const out: TileHistory[] = [];
  world.terrain.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '~') continue;
      const list = changes.get(`${x},${y}`) ?? [];
      // Only the "land" action turns water into sand – every other tile was part of the genesis sandbank.
      const genesisTile = list.length === 0 || list[0]?.terrain !== 'sand';
      const states: TileState[] = genesisTile ? [{ day: 0, terrain: 'sand' }, ...list] : list;
      out.push({ x, y, states });
    }
  });
  return out;
}

export function terrainAtDay(history: TileHistory, day: number): TileState | undefined {
  let current: TileState | undefined;
  for (const state of history.states) {
    if (state.day <= day) current = state;
    else break;
  }
  return current;
}

export function seasonAtDay(world: World, day: number): Season {
  const last = world.days[world.days.length - 1]?.day ?? 0;
  const d = Math.max(0, Math.min(Math.floor(day), last));
  return seasonOf(addDays(world.genesis, d));
}

export function paletteAtDay(world: World, day: number): Palette {
  return PALETTES[seasonAtDay(world, day)];
}

/** Bounding box of the land visible on `day`, in tile coordinates. */
export function landBounds(histories: TileHistory[], day: number) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const h of histories) {
    if (!terrainAtDay(h, day)) continue;
    minX = Math.min(minX, h.x);
    minY = Math.min(minY, h.y);
    maxX = Math.max(maxX, h.x + 1);
    maxY = Math.max(maxY, h.y + 1);
  }
  if (!Number.isFinite(minX)) return { cx: 32, cz: 32, radius: 2 };
  return {
    cx: (minX + maxX) / 2,
    cz: (minY + maxY) / 2,
    radius: Math.max(2, Math.hypot(maxX - minX, maxY - minY) / 2),
  };
}

/** Distance (in tiles) from each tile centre to the nearest land on `day` – feeds the sea shader. */
export function distanceField(
  width: number,
  height: number,
  histories: TileHistory[],
  day: number,
  cap = 16,
): Float32Array {
  const dist = new Float32Array(width * height).fill(cap);
  for (const h of histories) {
    if (terrainAtDay(h, day)) dist[h.y * width + h.x] = 0;
  }
  // Two-pass chamfer distance (1, √2) – good enough for a foam line.
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= width || y >= height ? cap : (dist[y * width + x] as number);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      dist[i] = Math.min(
        dist[i] as number,
        at(x - 1, y) + 1,
        at(x, y - 1) + 1,
        at(x - 1, y - 1) + Math.SQRT2,
        at(x + 1, y - 1) + Math.SQRT2,
      );
    }
  for (let y = height - 1; y >= 0; y--)
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      dist[i] = Math.min(
        dist[i] as number,
        at(x + 1, y) + 1,
        at(x, y + 1) + 1,
        at(x + 1, y + 1) + Math.SQRT2,
        at(x - 1, y + 1) + Math.SQRT2,
      );
    }
  return dist;
}
