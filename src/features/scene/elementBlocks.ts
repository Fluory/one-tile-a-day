import { CLOTHES, FUR, PALETTES, ROOFS, SAILS, type Palette } from '@/features/render';
import { hashCell, hashString, type Element, type Terrain, type World } from '@/features/world';
import { HEIGHT, type Animated, type Block } from './model';

/**
 * Everything standing on the island as low-poly blocks: each building, tree, person and animal
 * is assembled from the six shared shapes and remembers the day it appeared.
 */

const jitter = (x: number, y: number, salt: number, amount: number) =>
  ((hashCell(x, y, salt) % 1000) / 1000 - 0.5) * amount;

/** Blocks for everything standing on the island (terrain tiles are handled separately). */
export function elementBlocks(world: World, palette: Palette): { blocks: Block[]; animated: Animated[] } {
  const blocks: Block[] = [];
  const animated: Animated[] = [];
  const terrainOf = (x: number, y: number): Terrain => {
    const ch = world.terrain[y]?.[x];
    return ch === '.' ? 'sand' : ch === ',' ? 'grass' : ch === '^' ? 'rock' : ch === '*' ? 'forest' : 'water';
  };
  const winter = palette === PALETTES.winter;
  const residents = new Map<string, Element[]>();
  for (const e of world.elements) {
    if (e.type === 'inhabitant' && e.home) residents.set(e.home, [...(residents.get(e.home) ?? []), e]);
  }

  const add = (b: Block) => blocks.push(b);

  for (const e of world.elements) {
    const t = terrainOf(e.x, e.y);
    const h = HEIGHT[t];
    const cx = e.x + 0.5;
    const cz = e.y + 0.5;
    const from = e.day;
    switch (e.type) {
      case 'tree': {
        const kind = e.variant % 4;
        const trunk = kind === 2 ? palette.white : palette.trunk;
        add({ geo: 'cyl', color: trunk, pos: [cx, h + 0.17, cz], scale: [0.1, 0.34, 0.1], from });
        if (kind === 1) {
          add({ geo: 'cone8', color: palette.pine1, pos: [cx, h + 0.52, cz], scale: [0.62, 0.5, 0.62], from });
          add({
            geo: 'cone8',
            color: winter ? palette.snow : palette.pine0,
            pos: [cx, h + 0.8, cz],
            scale: [0.44, 0.4, 0.44],
            from,
          });
        } else if (!winter) {
          const canopy = kind === 2 ? palette.leaf2 : palette.leaf1;
          add({ geo: 'ico', color: canopy, pos: [cx, h + 0.58, cz], scale: [0.62, 0.56, 0.62], rotY: e.variant, from });
          add({
            geo: 'ico',
            color: palette.leaf0,
            pos: [cx + 0.12, h + 0.46, cz + 0.1],
            scale: [0.36, 0.32, 0.36],
            from,
          });
          if (kind === 3)
            add({
              geo: 'ico',
              color: palette.accent,
              pos: [cx - 0.16, h + 0.62, cz + 0.2],
              scale: [0.1, 0.1, 0.1],
              from,
            });
        } else {
          add({ geo: 'ico', color: palette.snow, pos: [cx, h + 0.52, cz], scale: [0.3, 0.2, 0.3], from });
        }
        break;
      }
      case 'house': {
        const [, roof] = ROOFS[e.variant % ROOFS.length] ?? ['#9c3b2e', '#c95a3c'];
        const rot = (hashCell(e.x, e.y, 4) % 2) * (Math.PI / 2);
        add({ geo: 'box', color: palette.wall1, pos: [cx, h + 0.21, cz], scale: [0.62, 0.42, 0.54], rotY: rot, from });
        add({ geo: 'prism', color: roof, pos: [cx, h + 0.56, cz], scale: [0.72, 0.3, 0.64], rotY: rot, from });
        add({
          geo: 'box',
          color: palette.stone0,
          pos: [cx + 0.18, h + 0.66, cz - 0.1],
          scale: [0.08, 0.22, 0.08],
          from,
        });
        add({
          geo: 'box',
          color: palette.light,
          pos: [cx - 0.12, h + 0.24, cz + 0.275],
          scale: [0.12, 0.12, 0.02],
          from,
          glow: true,
        });
        add({
          geo: 'box',
          color: palette.door,
          pos: [cx + 0.12, h + 0.14, cz + 0.275],
          scale: [0.12, 0.26, 0.02],
          from,
        });
        (residents.get(e.id) ?? []).forEach((r, i) => {
          const hash = hashString(r.id);
          const px = cx + (i === 0 ? 0.42 : -0.42);
          const pz = cz + 0.36;
          const small = r.role === 'child' ? 0.7 : 1;
          add({
            geo: 'cyl',
            color: CLOTHES[r.role ?? ''] ?? palette.cloth,
            pos: [px, h + 0.11 * small, pz],
            scale: [0.13 * small, 0.22 * small, 0.13 * small],
            from: r.day,
          });
          add({
            geo: 'ico',
            color: ['#f1c7a4', '#e2a77f', '#c48457', '#8d5a3b', '#5e3a26'][hash % 5] ?? '#e2a77f',
            pos: [px, h + 0.28 * small, pz],
            scale: [0.12 * small, 0.12 * small, 0.12 * small],
            from: r.day,
          });
        });
        break;
      }
      case 'path':
        add({ geo: 'box', color: palette.path1, pos: [cx, h + 0.012, cz], scale: [0.86, 0.03, 0.86], from });
        break;
      case 'field':
        add({ geo: 'box', color: palette.soil0, pos: [cx, h + 0.02, cz], scale: [0.9, 0.05, 0.9], from });
        for (let i = 0; i < 3; i++) {
          add({
            geo: 'box',
            color: e.variant === 0 ? palette.crop1 : palette.leaf1,
            pos: [cx, h + 0.08, cz - 0.28 + i * 0.28],
            scale: [0.8, 0.08, 0.12],
            from,
          });
        }
        break;
      case 'garden': {
        const flowers = [palette.flower1, palette.flower2, palette.flower3];
        for (let i = 0; i < 5; i++) {
          add({
            geo: 'ico',
            color: flowers[(i + e.variant) % 3] as string,
            pos: [cx - 0.3 + i * 0.15, h + 0.09, cz + jitter(e.x, e.y, i, 0.5)],
            scale: [0.12, 0.12, 0.12],
            from,
          });
        }
        add({ geo: 'box', color: palette.wood1, pos: [cx, h + 0.06, cz + 0.4], scale: [0.86, 0.1, 0.04], from });
        break;
      }
      case 'well':
        add({ geo: 'cyl', color: palette.stone1, pos: [cx, h + 0.1, cz], scale: [0.42, 0.2, 0.42], from });
        add({ geo: 'cyl', color: palette.sea1, pos: [cx, h + 0.21, cz], scale: [0.3, 0.02, 0.3], from });
        add({ geo: 'box', color: palette.wood0, pos: [cx - 0.18, h + 0.32, cz], scale: [0.05, 0.42, 0.05], from });
        add({ geo: 'box', color: palette.wood0, pos: [cx + 0.18, h + 0.32, cz], scale: [0.05, 0.42, 0.05], from });
        add({ geo: 'prism', color: palette.wood1, pos: [cx, h + 0.58, cz], scale: [0.5, 0.16, 0.34], from });
        break;
      case 'jetty':
        add({
          geo: 'box',
          color: palette.wood1,
          pos: [cx, 0.14, cz],
          scale: [0.92, 0.06, 0.62],
          rotY: terrainOf(e.x, e.y - 1) !== 'water' || terrainOf(e.x, e.y + 1) !== 'water' ? Math.PI / 2 : 0,
          from,
        });
        for (const [dx, dz] of [
          [-0.36, -0.22],
          [0.36, -0.22],
          [-0.36, 0.22],
          [0.36, 0.22],
        ] as const)
          add({ geo: 'cyl', color: palette.wood0, pos: [cx + dx, 0.02, cz + dz], scale: [0.07, 0.3, 0.07], from });
        break;
      case 'boat':
        animated.push({ kind: 'boat', x: cx, y: cz, from, color: SAILS[e.variant % SAILS.length], height: 0 });
        break;
      case 'harbor':
        add({ geo: 'box', color: palette.stone1, pos: [cx, h + 0.04, cz], scale: [0.96, 0.1, 0.96], from });
        add({ geo: 'box', color: palette.wood1, pos: [cx - 0.2, h + 0.2, cz - 0.18], scale: [0.22, 0.22, 0.22], from });
        add({
          geo: 'box',
          color: palette.wood0,
          pos: [cx - 0.02, h + 0.16, cz - 0.24],
          scale: [0.16, 0.14, 0.16],
          from,
        });
        add({
          geo: 'cyl',
          color: palette.metal,
          pos: [cx + 0.26, h + 0.16, cz + 0.2],
          scale: [0.14, 0.16, 0.14],
          from,
        });
        break;
      case 'lighthouse': {
        add({ geo: 'cyl', color: palette.stone1, pos: [cx, h + 0.08, cz], scale: [0.6, 0.16, 0.6], from });
        const stripes = [palette.white, palette.red, palette.white, palette.red, palette.white];
        stripes.forEach((color, i) => {
          const w = 0.4 - i * 0.03;
          add({ geo: 'cyl', color, pos: [cx, h + 0.26 + i * 0.22, cz], scale: [w, 0.22, w], from });
        });
        add({ geo: 'cyl', color: palette.metal, pos: [cx, h + 1.37, cz], scale: [0.42, 0.04, 0.42], from });
        add({ geo: 'ico', color: palette.light, pos: [cx, h + 1.5, cz], scale: [0.22, 0.22, 0.22], from, glow: true });
        add({ geo: 'cone8', color: palette.red, pos: [cx, h + 1.72, cz], scale: [0.34, 0.24, 0.34], from });
        animated.push({ kind: 'beam', x: cx, y: cz, from, height: h + 1.5 });
        break;
      }
      case 'library':
        add({ geo: 'box', color: palette.stone1, pos: [cx, h + 0.26, cz], scale: [0.82, 0.52, 0.66], from });
        add({ geo: 'prism', color: '#6a5a9a', pos: [cx, h + 0.68, cz], scale: [0.9, 0.32, 0.74], from });
        for (let i = 0; i < 4; i++)
          add({
            geo: 'cyl',
            color: palette.white,
            pos: [cx - 0.3 + i * 0.2, h + 0.24, cz + 0.37],
            scale: [0.07, 0.48, 0.07],
            from,
          });
        add({
          geo: 'box',
          color: palette.light,
          pos: [cx, h + 0.32, cz + 0.335],
          scale: [0.5, 0.1, 0.02],
          from,
          glow: true,
        });
        break;
      case 'windmill':
        add({ geo: 'cyl', color: palette.wall1, pos: [cx, h + 0.38, cz], scale: [0.44, 0.76, 0.44], from });
        add({
          geo: 'cone8',
          color: ROOFS[0]?.[1] ?? palette.roof1,
          pos: [cx, h + 0.9, cz],
          scale: [0.54, 0.3, 0.54],
          from,
        });
        animated.push({ kind: 'blades', x: cx, y: cz + 0.24, from, height: h + 0.82 });
        break;
      case 'market': {
        const awning = e.variant % 2 === 0 ? palette.red : '#3f6fb0';
        for (const side of [-0.22, 0.22]) {
          add({ geo: 'box', color: palette.wood1, pos: [cx + side, h + 0.14, cz], scale: [0.36, 0.1, 0.5], from });
          add({
            geo: 'box',
            color: palette.wood0,
            pos: [cx + side - 0.16, h + 0.26, cz + 0.22],
            scale: [0.03, 0.5, 0.03],
            from,
          });
          add({
            geo: 'box',
            color: palette.wood0,
            pos: [cx + side + 0.16, h + 0.26, cz + 0.22],
            scale: [0.03, 0.5, 0.03],
            from,
          });
          add({ geo: 'box', color: awning, pos: [cx + side, h + 0.52, cz + 0.06], scale: [0.4, 0.04, 0.5], from });
          add({
            geo: 'ico',
            color: palette.flower2,
            pos: [cx + side - 0.06, h + 0.22, cz],
            scale: [0.08, 0.08, 0.08],
            from,
          });
          add({
            geo: 'ico',
            color: palette.flower1,
            pos: [cx + side + 0.07, h + 0.22, cz + 0.05],
            scale: [0.08, 0.08, 0.08],
            from,
          });
        }
        break;
      }
      case 'ruin':
        for (let i = 0; i < 4; i++) {
          const hgt = 0.2 + ((hashCell(e.x, e.y, i) % 100) / 100) * 0.45;
          add({
            geo: 'cyl',
            color: i % 2 ? palette.stone0 : palette.stone1,
            pos: [cx - 0.3 + (i % 2) * 0.6, h + hgt / 2, cz - 0.3 + Math.floor(i / 2) * 0.6],
            scale: [0.14, hgt, 0.14],
            from,
          });
        }
        add({ geo: 'box', color: palette.grass0, pos: [cx, h + 0.04, cz], scale: [0.6, 0.06, 0.3], rotY: 0.4, from });
        break;
      case 'animal': {
        const species = e.role ?? 'sheep';
        const [body, head] = FUR[species] ?? ['#ccc', '#444'];
        if (species === 'gull') {
          animated.push({ kind: 'gull', x: cx, y: cz, from, color: body, height: 2.2 + jitter(e.x, e.y, 3, 1) });
          break;
        }
        const size = species === 'deer' ? 1.2 : species === 'rabbit' || species === 'crab' ? 0.6 : 0.85;
        const rot = ((hashCell(e.x, e.y, 8) % 8) * Math.PI) / 4;
        add({
          geo: 'ico',
          color: body,
          pos: [cx, h + 0.1 * size, cz],
          scale: [0.3 * size, 0.2 * size, 0.2 * size],
          rotY: rot,
          from,
        });
        add({
          geo: 'box',
          color: head,
          pos: [cx + Math.cos(rot) * 0.15 * size, h + 0.16 * size, cz - Math.sin(rot) * 0.15 * size],
          scale: [0.1 * size, 0.1 * size, 0.1 * size],
          rotY: rot,
          from,
        });
        break;
      }
      case 'inhabitant':
        break;
    }
  }

  // Forest canopies and boulders give the ground tiles some volume.
  world.terrain.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch !== '*' && ch !== '^') continue;
      const day = firstDayAs(world, x, y, ch === '*' ? 'forest' : 'rock');
      if (ch === '*') {
        for (let i = 0; i < 3; i++) {
          const s = 0.42 + ((hashCell(x, y, 30 + i) % 100) / 100) * 0.22;
          add({
            geo: i === 0 && !winter ? 'ico' : 'cone8',
            color: i === 1 ? palette.forest2 : winter && i === 2 ? palette.snow : palette.forest1,
            pos: [x + 0.5 + jitter(x, y, 40 + i, 0.5), HEIGHT.forest + s * 0.55, y + 0.5 + jitter(x, y, 50 + i, 0.5)],
            scale: [s, s * 1.2, s],
            from: day,
          });
        }
      } else {
        const s = 0.3 + ((hashCell(x, y, 60) % 100) / 100) * 0.25;
        add({
          geo: 'ico',
          color: winter ? palette.snow : palette.rock2,
          pos: [x + 0.5 + jitter(x, y, 61, 0.4), HEIGHT.rock + s * 0.3, y + 0.5 + jitter(x, y, 62, 0.4)],
          scale: [s, s * 0.7, s],
          rotY: x + y,
          from: day,
        });
      }
    }
  });

  return { blocks, animated };
}

function firstDayAs(world: World, x: number, y: number, terrain: Terrain): number {
  for (const entry of world.days) {
    if (entry.terrain && entry.x === x && entry.y === y && entry.terrain.to === terrain) return entry.day;
  }
  return 0;
}
