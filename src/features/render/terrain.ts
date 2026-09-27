import { hashCell, type Season, type Terrain, type WorldContext } from '@/features/world';
import type { PixelCanvas } from './canvas';
import type { Palette } from './palette';

/**
 * Terrain at pixel level. Tiles are 8×8 pixels, but the ground is interpolated between tile
 * centres (a bilinear "marching squares" field) so coasts, meadows and rocks get soft,
 * rounded outlines instead of hard squares. The sea darkens with distance from the shore,
 * using ordered dithering like old console games.
 */

export const TILE = 8;

const TYPES: readonly Terrain[] = ['water', 'sand', 'grass', 'rock', 'forest'];
const WATER = 0;
const SAND = 1;
const GRASS = 2;
const ROCK = 3;
const FOREST = 4;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)] as number;

const FOREST_BLOBS = [
  ['.bb.', 'bcbb', 'bbbb', '.bb.'],
  ['.cb.', 'bbbb', 'bbbb', '.b..'],
  ['..c.', '.bbb', 'bbbb', '.bb.'],
];
const BOULDER = ['.hh.', 'hmmz', 'hmmz', '.zz.'];

export interface TerrainFrame {
  x: number;
  y: number;
  size: number;
}

export interface WaveLayers {
  a: PixelCanvas;
  b: PixelCanvas;
}

export function paintTerrain(
  ctx: WorldContext,
  frame: TerrainFrame,
  C: Palette,
  season: Season,
  base: PixelCanvas,
  waves: WaveLayers,
): void {
  const size = frame.size * TILE;
  const originX = frame.x * TILE;
  const originY = frame.y * TILE;
  const kind = new Uint8Array(size * size);
  const typeIndex = (tx: number, ty: number) => TYPES.indexOf(ctx.grid.get(tx, ty) ?? 'water');
  const acc = new Float32Array(TYPES.length);

  // 1 · classify every pixel from the four nearest tile centres
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const gx = originX + px;
      const gy = originY + py;
      const fx = (gx + 0.5) / TILE - 0.5;
      const fy = (gy + 0.5) / TILE - 0.5;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const ax = fx - x0;
      const ay = fy - y0;
      acc.fill(0);
      acc[typeIndex(x0, y0)]! += (1 - ax) * (1 - ay);
      acc[typeIndex(x0 + 1, y0)]! += ax * (1 - ay);
      acc[typeIndex(x0, y0 + 1)]! += (1 - ax) * ay;
      acc[typeIndex(x0 + 1, y0 + 1)]! += ax * ay;
      const noise = ((hashCell(gx, gy, 5) % 1000) / 1000 - 0.5) * 0.16;
      let k = WATER;
      if (1 - (acc[WATER] as number) + noise > 0.5) {
        let best = -1;
        for (let t = 1; t < TYPES.length; t++) {
          const w = (acc[t] as number) + ((hashCell(gx, gy, 20 + t) % 1000) / 1000) * 0.14;
          if ((acc[t] as number) > 0 && w > best) {
            best = w;
            k = t;
          }
        }
      }
      kind[py * size + px] = k;
    }
  }

  // 2 · chamfer distance (3-4) from land, in thirds of a pixel
  const dist = new Float32Array(size * size);
  for (let i = 0; i < dist.length; i++) dist[i] = kind[i] === WATER ? 1e9 : 0;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= size || y >= size ? 1e9 : (dist[y * size + x] as number));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      dist[i] = Math.min(dist[i] as number, at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
    }
  }
  for (let y = size - 1; y >= 0; y--) {
    for (let x = size - 1; x >= 0; x--) {
      const i = y * size + x;
      dist[i] = Math.min(dist[i] as number, at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
    }
  }

  const kindAt = (x: number, y: number) => (x < 0 || y < 0 || x >= size || y >= size ? WATER : (kind[y * size + x] as number));
  const touches = (x: number, y: number, test: (k: number) => boolean) =>
    test(kindAt(x - 1, y)) || test(kindAt(x + 1, y)) || test(kindAt(x, y - 1)) || test(kindAt(x, y + 1));

  // 3 · colour
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const gx = originX + px;
      const gy = originY + py;
      const k = kind[py * size + px] as number;
      const h = hashCell(gx, gy, 3) % 100;
      let color: string;
      switch (k) {
        case WATER: {
          const d = (dist[py * size + px] as number) / 3;
          if (touches(px, py, (n) => n !== WATER)) color = h % 6 === 0 ? C.sea2 : C.foam;
          else if (d > 2.6 && d < 3.5 && h % 3 !== 0) color = C.sea3;
          else if (d <= 5) color = C.sea2;
          else if (d <= 9) color = bayer(gx, gy) < (d - 5) / 4 ? C.sea1 : C.sea2;
          else if (d <= 16) color = C.sea1;
          else if (d <= 28) color = bayer(gx, gy) < (d - 16) / 12 ? C.sea0 : C.sea1;
          else color = C.sea0;
          break;
        }
        case SAND:
          color = h < 5 ? C.sand2 : h < 9 ? C.sand0 : C.sand1;
          if (touches(px, py, (n) => n === WATER)) color = C.sand0;
          break;
        case GRASS:
          color = h < 8 ? C.grass2 : h < 15 ? C.grass0 : C.grass1;
          if (touches(px, py, (n) => n === SAND || n === WATER) && (gx + gy) % 2 === 0) color = C.sand1;
          break;
        case FOREST: {
          const cell = hashCell(gx >> 2, gy >> 2, 13);
          const blob = FOREST_BLOBS[cell % FOREST_BLOBS.length] as string[];
          const ch = blob[gy & 3]?.[gx & 3] ?? '.';
          if (ch === '.') color = C.forest0;
          else if (season === 'winter' && (gy & 3) === 0) color = C.snow;
          else color = ch === 'c' ? C.forest2 : C.forest1;
          if (touches(px, py, (n) => n === GRASS || n === SAND) && ch === '.') color = C.grass0;
          break;
        }
        default: {
          const shift = ((gy >> 2) & 1) * 2;
          const ch = BOULDER[gy & 3]?.[(gx + shift) & 3] ?? '.';
          color = ch === 'h' ? (season === 'winter' ? C.snow : C.rock2) : ch === 'm' ? C.rock1 : C.rock0;
          if (h < 4) color = C.rock0;
          if (kindAt(px, py + 1) !== ROCK && ch !== 'h') color = C.rock0;
        }
      }
      base.put(px, py, color);
    }
  }

  // 4 · waves on open water, two frames
  for (let ty = 0; ty < frame.size; ty++) {
    for (let tx = 0; tx < frame.size; tx++) {
      const hw = hashCell(frame.x + tx, frame.y + ty, 9);
      if (hw % 3 !== 0) continue;
      const wx = tx * TILE + (hw % 5);
      const wy = ty * TILE + 1 + ((hw >> 3) % 6);
      let open = true;
      for (let i = -1; i < 5; i++) {
        const x = wx + i;
        if (kindAt(x, wy) !== WATER || (dist[wy * size + Math.min(size - 1, Math.max(0, x))] as number) / 3 < 12) open = false;
      }
      if (!open) continue;
      for (let i = 0; i < 3; i++) {
        waves.a.put(wx + i, wy, C.sea3);
        waves.b.put(wx + i + 1, wy, C.sea3);
      }
    }
  }
}
