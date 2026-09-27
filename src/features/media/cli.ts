import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { Resvg } from '@resvg/resvg-js';
import { readWorld } from '@/features/routine/files';
import { getSimulation } from '@/features/world-data';
import { bannerSvg } from './banner';
import { timelapseGif } from './timelapse';

/**
 * Media for the repository (never part of the daily commit):
 *   npm run media -- banner   --out docs/media/banner.svg
 *   npm run media -- social   --out docs/media/social-preview.png
 *   npm run media -- timelapse --source real|simulation --out timelapse.gif
 */
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    source: { type: 'string', default: 'real' },
    every: { type: 'string', default: '1' },
    scale: { type: 'string', default: '2' },
  },
});

const write = (path: string, data: string | Uint8Array) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
  process.stdout.write(`wrote ${path} (${Math.round((typeof data === 'string' ? data.length : data.byteLength) / 1024)} KB)\n`);
};

switch (positionals[0]) {
  case 'banner':
    write(values.out ?? 'docs/media/banner.svg', bannerSvg());
    break;
  case 'social': {
    const svg = bannerSvg({ width: 1280, height: 640, animated: false });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } }).render().asPng();
    write(values.out ?? 'docs/media/social-preview.png', png);
    break;
  }
  case 'timelapse': {
    const simulated = values.source === 'simulation';
    const world = simulated ? getSimulation() : readWorld();
    const gif = timelapseGif(world, {
      every: Number(values.every),
      scale: Number(values.scale),
      label: simulated ? 'SIMULATED YEAR' : undefined,
    });
    write(values.out ?? 'timelapse.gif', gif);
    break;
  }
  default:
    process.stdout.write('usage: npm run media -- <banner|social|timelapse> [--out path] [--source real|simulation]\n');
    process.exit(1);
}
