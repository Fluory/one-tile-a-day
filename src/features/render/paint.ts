import { hashCell, hashString, seasonOf, WorldContext, type Element, type Season, type World } from '@/features/world';
import { PixelCanvas } from './canvas';
import { paintTerrain, TILE } from './terrain';
import { AWNINGS, CLOTHES, FUR, PALETTES, ROOFS, SAILS, type ColorKey, type Palette } from './palette';
import {
  ANIMALS,
  BOAT,
  CHILD,
  FIELDS,
  GARDENS,
  HARBOR,
  HOUSE,
  JETTY_H,
  JETTY_V,
  LEGEND,
  LIBRARY,
  LIGHTHOUSE,
  MARKET,
  PERSON,
  RUINS,
  SAILS_A,
  SAILS_B,
  TREES,
  WELL,
  WINDMILL,
  type Sprite,
} from './sprites';

export { TILE };
export const FRAME_SIZES = [16, 32, 64] as const;

export interface Frame {
  x: number;
  y: number;
  size: number;
}

export const OVERLAYS = ['waveA', 'waveB', 'sailsA', 'sailsB', 'lamp', 'bob', 'smokeA', 'smokeB', 'mark'] as const;
export type Overlay = (typeof OVERLAYS)[number];

export interface PaintedIsland {
  frame: Frame;
  width: number;
  height: number;
  season: Season;
  palette: Palette;
  base: PixelCanvas;
  overlays: Record<Overlay, PixelCanvas>;
}

export interface PaintOptions {
  frame?: Frame;
  /** Tile to mark as "new today"; defaults to the latest day, `null` for none. */
  highlight?: { x: number; y: number } | null;
  season?: Season;
}

const SKINS = ['#f1c7a4', '#e2a77f', '#c48457', '#8d5a3b', '#5e3a26'];
const HAIRS = ['#2b1d16', '#4a3223', '#8a5a2e', '#d9b25e', '#a8a39c', '#b5462e'];
const LIBRARY_ROOF: [string, string] = ['#4a3f6b', '#6a5a9a'];
const PUBLIC = new Set(['house', 'path', 'well', 'market', 'library', 'harbor', 'windmill', 'lighthouse', 'jetty']);

/** Smallest standard frame that shows the whole island with a margin of open sea. */
export function chooseFrame(world: World): Frame {
  const ctx = new WorldContext(world);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const include = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const [x, y] of ctx.landCells()) include(x, y);
  for (const e of world.elements) include(e.x, e.y);
  if (!Number.isFinite(minX)) return { x: 0, y: 0, size: Math.min(world.width, world.height) };
  const margin = 3;
  const span = Math.max(maxX - minX, maxY - minY) + 1 + margin * 2;
  const size =
    FRAME_SIZES.find((s) => s >= span && s <= Math.min(world.width, world.height)) ??
    Math.min(world.width, world.height);
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
  const quantise = (v: number) => Math.round(v / 2) * 2;
  const x = clamp(quantise((minX + maxX + 1) / 2 - size / 2), world.width - size);
  const y = clamp(quantise((minY + maxY + 1) / 2 - size / 2), world.height - size);
  return { x, y, size };
}

export function paintWorld(world: World, options: PaintOptions = {}): PaintedIsland {
  const ctx = new WorldContext(world);
  const latest = world.days[world.days.length - 1];
  const season = options.season ?? seasonOf(latest?.date ?? world.genesis);
  const palette = PALETTES[season];
  const frame = options.frame ?? chooseFrame(world);
  const width = frame.size * TILE;
  const height = frame.size * TILE;
  const base = new PixelCanvas(width, height);
  const overlays = Object.fromEntries(OVERLAYS.map((o) => [o, new PixelCanvas(width, height)])) as Record<
    Overlay,
    PixelCanvas
  >;
  const g = ctx.grid;
  const C = palette;

  paintTerrain(ctx, frame, C, season, base, { a: overlays.waveA, b: overlays.waveB });

  // ---------------------------------------------------------------- things
  const inFrame = (e: Element) =>
    e.x >= frame.x && e.y >= frame.y && e.x < frame.x + frame.size && e.y < frame.y + frame.size;
  const drawables = world.elements
    .filter(inFrame)
    .sort((a, b) => a.y - b.y || a.x - b.x || order(a) - order(b) || Number(a.id.slice(1)) - Number(b.id.slice(1)));

  const colorOf = (char: string, overrides: Partial<Record<ColorKey, string>>): string | undefined => {
    const key = LEGEND[char];
    if (!key) return undefined;
    return overrides[key] ?? C[key];
  };

  const stamp = (
    target: PixelCanvas,
    sprite: Sprite,
    left: number,
    bottom: number,
    overrides: Partial<Record<ColorKey, string>> = {},
  ) => {
    const top = bottom - sprite.length + 1;
    sprite.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i] as string;
        if (ch === '.') continue;
        const color = colorOf(ch, overrides);
        if (color) target.put(left + i, top + j, color);
      }
    });
  };

  const connects = (x: number, y: number) => {
    const s = ctx.structureAt(x, y);
    return s !== undefined && PUBLIC.has(s.type);
  };

  for (const e of drawables) {
    const ox = (e.x - frame.x) * TILE;
    const oy = (e.y - frame.y) * TILE;
    const bottom = oy + TILE - 1;
    switch (e.type) {
      case 'tree': {
        const kind = (['oak', 'pine', 'birch', 'apple'] as const)[e.variant % 4] ?? 'oak';
        const sprite = season === 'winter' ? (kind === 'pine' ? TREES.snowPine : TREES.bare) : TREES[kind];
        stamp(base, sprite, ox, bottom);
        break;
      }
      case 'house': {
        const [roof0, roof1] = ROOFS[e.variant % ROOFS.length] ?? ROOFS[0] ?? ['#000', '#000'];
        stamp(base, HOUSE, ox, bottom, { roof0, roof1 });
        if (season === 'autumn' || season === 'winter') {
          const smoke = '#ece8e0b0';
          overlays.smokeA.put(ox + 5, oy - 3, smoke);
          overlays.smokeA.put(ox + 6, oy - 5, smoke);
          overlays.smokeB.put(ox + 6, oy - 4, smoke);
          overlays.smokeB.put(ox + 5, oy - 6, smoke);
        }
        const residents = ctx.residentsOf(e.id);
        residents.forEach((r, index) => {
          const hash = hashString(r.id);
          const person = r.role === 'child' ? CHILD : PERSON;
          stamp(base, person, ox + (index === 0 ? 6 : -1), bottom, {
            cloth: CLOTHES[r.role ?? ''] ?? C.cloth,
            skin: SKINS[hash % SKINS.length],
            hair: HAIRS[(hash >> 4) % HAIRS.length],
          });
        });
        break;
      }
      case 'path': {
        const arms = {
          N: connects(e.x, e.y - 1),
          S: connects(e.x, e.y + 1),
          W: connects(e.x - 1, e.y),
          E: connects(e.x + 1, e.y),
        };
        const paint = (px: number, py: number) => {
          const h = hashCell(ox + px, oy + py, 17) % 100;
          base.put(ox + px, oy + py, h < 18 ? C.path0 : C.path1);
        };
        for (let py = 2; py <= 5; py++) for (let px = 2; px <= 5; px++) paint(px, py);
        if (arms.N) for (let py = 0; py < 2; py++) for (let px = 2; px <= 5; px++) paint(px, py);
        if (arms.S) for (let py = 6; py < 8; py++) for (let px = 2; px <= 5; px++) paint(px, py);
        if (arms.W) for (let px = 0; px < 2; px++) for (let py = 2; py <= 5; py++) paint(px, py);
        if (arms.E) for (let px = 6; px < 8; px++) for (let py = 2; py <= 5; py++) paint(px, py);
        break;
      }
      case 'field':
        stamp(base, FIELDS[e.variant % FIELDS.length] ?? FIELDS[0] ?? [], ox, bottom);
        break;
      case 'garden':
        stamp(base, GARDENS[e.variant % GARDENS.length] ?? GARDENS[0] ?? [], ox, bottom);
        break;
      case 'well':
        stamp(base, WELL, ox, bottom, { roof0: C.wood0, roof1: C.wood1 });
        break;
      case 'jetty': {
        const vertical = g.isLand(e.x, e.y - 1) || g.isLand(e.x, e.y + 1);
        stamp(base, vertical ? JETTY_V : JETTY_H, ox, bottom);
        break;
      }
      case 'boat':
        stamp(overlays.bob, BOAT, ox, bottom, { sail: SAILS[e.variant % SAILS.length] });
        break;
      case 'harbor':
        stamp(base, HARBOR, ox, bottom);
        break;
      case 'lighthouse': {
        stamp(base, LIGHTHOUSE, ox, bottom);
        const top = bottom - LIGHTHOUSE.length + 1;
        const glow = '#fff3b0';
        const halo = '#ffe27a66';
        for (const [px, py] of [
          [3, 0],
          [4, 0],
          [3, 1],
          [4, 1],
        ] as const)
          overlays.lamp.put(ox + px, top + py, glow);
        for (const [px, py] of [
          [1, 0],
          [2, -1],
          [5, -1],
          [6, 0],
          [0, 1],
          [7, 1],
          [3, -2],
          [4, -2],
        ] as const)
          overlays.lamp.put(ox + px, top + py, halo);
        break;
      }
      case 'library':
        stamp(base, LIBRARY, ox, bottom, { roof0: LIBRARY_ROOF[0], roof1: LIBRARY_ROOF[1] });
        break;
      case 'windmill': {
        stamp(base, WINDMILL, ox, bottom);
        const top = bottom - WINDMILL.length + 1;
        stamp(overlays.sailsA, SAILS_A, ox, top + SAILS_A.length - 1);
        stamp(overlays.sailsB, SAILS_B, ox, top + SAILS_B.length - 1);
        break;
      }
      case 'market':
        stamp(base, MARKET, ox, bottom, { awning: AWNINGS[e.variant % AWNINGS.length] });
        break;
      case 'ruin':
        stamp(base, RUINS[e.variant % RUINS.length] ?? RUINS[0] ?? [], ox, bottom);
        break;
      case 'animal': {
        const species = e.role ?? 'sheep';
        const sprite = ANIMALS[species] ?? ANIMALS.sheep ?? [];
        const [fur0, fur1] = FUR[species] ?? ['#888', '#444'];
        const w = sprite[0]?.length ?? 4;
        const left = ox + Math.floor((TILE - w) / 2);
        stamp(base, sprite, left, species === 'gull' ? oy + 3 : oy + 6, { fur0, fur1 });
        break;
      }
      case 'inhabitant':
        // Drawn together with their house.
        break;
    }
  }

  // ---------------------------------------------------------------- highlight
  const mark = options.highlight === undefined ? latestTile(world) : options.highlight;
  if (
    mark &&
    mark.x >= frame.x &&
    mark.y >= frame.y &&
    mark.x < frame.x + frame.size &&
    mark.y < frame.y + frame.size
  ) {
    const ox = (mark.x - frame.x) * TILE;
    const oy = (mark.y - frame.y) * TILE;
    const hi = C.highlight;
    const corners: [number, number, number, number][] = [
      [-1, -1, 1, 1],
      [TILE, -1, -1, 1],
      [-1, TILE, 1, -1],
      [TILE, TILE, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      for (let i = 0; i < 3; i++) {
        overlays.mark.put(ox + cx + dx * i, oy + cy, hi);
        overlays.mark.put(ox + cx, oy + cy + dy * i, hi);
      }
    }
  }

  return { frame, width, height, season, palette, base, overlays };
}

function order(e: Element): number {
  return e.type === 'inhabitant' || e.type === 'animal' ? 1 : 0;
}

function latestTile(world: World): { x: number; y: number } | null {
  const latest = world.days[world.days.length - 1];
  if (!latest || latest.action === 'genesis') return null;
  return { x: latest.x, y: latest.y };
}
