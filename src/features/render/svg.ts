import { formatDate, worldStats, type World } from '@/features/world';
import type { PixelCanvas } from './canvas';
import { GLYPH_HEIGHT, rasterText, textWidth, wrapText } from './font';
import { paintWorld, type Overlay, type PaintOptions } from './paint';

/**
 * The README image: today's island as animated pixel art plus a caption.
 * Output is deterministic – the same world always yields the same bytes.
 */

const WIDTH = 1024;
const PAD = 40;

const escapeXml = (text: string) =>
  text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

function runsToPath(runs: [number, number, number][]): string {
  return runs.map(([x, y, w]) => `M${x} ${y}h${w}v1h-${w}z`).join('');
}

function colorAttrs(color: string): string {
  if (color.length === 9) {
    const alpha = parseInt(color.slice(7, 9), 16) / 255;
    return `fill="${color.slice(0, 7)}" fill-opacity="${alpha.toFixed(2)}"`;
  }
  return `fill="${color}"`;
}

function canvasPaths(canvas: PixelCanvas): string {
  const parts: string[] = [];
  const runs = [...canvas.runs().entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [color, list] of runs) parts.push(`<path ${colorAttrs(color)} d="${runsToPath(list)}"/>`);
  return parts.join('');
}

function textPath(text: string): string {
  const runs: [number, number, number][] = [];
  const pixels: [number, number][] = [];
  rasterText(text, (x, y) => pixels.push([x, y]));
  pixels.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  for (const [x, y] of pixels) {
    const last = runs[runs.length - 1];
    if (last && last[1] === y && last[0] + last[2] === x) last[2]++;
    else runs.push([x, y, 1]);
  }
  return runsToPath(runs);
}

const OVERLAY_CLASS: Record<Overlay, string> = {
  waveA: 'fa',
  waveB: 'fb',
  sailsA: 'sa',
  sailsB: 'sb',
  lamp: 'lamp',
  bob: 'bob',
  smokeA: 'ka',
  smokeB: 'kb',
  mark: 'mark',
};

const STYLE = [
  '.fa{animation:fa 1.8s steps(1) infinite}',
  '.fb{animation:fb 1.8s steps(1) infinite}',
  '.sa{animation:fa .9s steps(1) infinite}',
  '.sb{animation:fb .9s steps(1) infinite}',
  '.ka{animation:fa 1.4s steps(1) infinite}',
  '.kb{animation:fb 1.4s steps(1) infinite}',
  '.lamp{animation:lamp 2.6s steps(1) infinite}',
  '.bob{animation:bob 2.2s steps(1) infinite}',
  '.mark{animation:mark 1.1s steps(1) infinite}',
  '@keyframes fa{0%{opacity:1}50%{opacity:0}}',
  '@keyframes fb{0%{opacity:0}50%{opacity:1}}',
  '@keyframes lamp{0%{opacity:1}55%{opacity:.2}}',
  '@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(1px)}}',
  '@keyframes mark{0%{opacity:1}50%{opacity:.25}}',
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
].join('');

export interface SvgOptions extends PaintOptions {
  /** Draw animated overlays (waves, sails, lamp …). Default true. */
  animated?: boolean;
  /** Caption below the map. Default true. */
  caption?: boolean;
}

export function renderIsleSvg(world: World, options: SvgOptions = {}): string {
  const painted = paintWorld(world, options);
  const animated = options.animated ?? true;
  const scale = WIDTH / painted.width;
  const stats = worldStats(world);
  const latest = stats.latest;
  const C = painted.palette;

  let captionHeight = 0;
  let caption = '';
  if (options.caption ?? true) {
    const small = 3;
    const big = 4;
    const line1 = `DAY ${latest.day} · ${formatDate(latest.date)} · ${painted.season}`;
    const right = `LAND ${stats.land} · PEOPLE ${stats.inhabitants}`;
    const titleLines = wrapText(latest.title, Math.floor((WIDTH - PAD * 2) / big), 2);
    const top = 34;
    const line1Y = top;
    const titleY = line1Y + GLYPH_HEIGHT * small + 22;
    captionHeight = titleY + titleLines.length * (GLYPH_HEIGHT * big + 14) + 22;
    caption = [
      `<rect x="0" y="${WIDTH}" width="${WIDTH}" height="${captionHeight}" fill="${C.bg}"/>`,
      `<rect x="0" y="${WIDTH}" width="${WIDTH}" height="4" fill="${C.highlight}" fill-opacity=".85"/>`,
      `<path transform="translate(${PAD} ${WIDTH + line1Y}) scale(${small})" fill="${C.textDim}" d="${textPath(line1)}"/>`,
      `<path transform="translate(${WIDTH - PAD - textWidth(right) * small} ${WIDTH + line1Y}) scale(${small})" fill="${C.textDim}" d="${textPath(right)}"/>`,
      ...titleLines.map(
        (line, i) =>
          `<path transform="translate(${PAD} ${WIDTH + titleY + i * (GLYPH_HEIGHT * big + 14)}) scale(${big})" fill="${C.text}" d="${textPath(line)}"/>`,
      ),
    ].join('');
  }

  const height = WIDTH + captionHeight;
  const overlays = (Object.keys(painted.overlays) as Overlay[])
    .filter((name) => !painted.overlays[name].isEmpty())
    .filter((name) => animated || !['waveB', 'sailsB', 'smokeB'].includes(name))
    .map((name) => {
      const cls = animated ? ` class="${OVERLAY_CLASS[name]}"` : '';
      return `<g${cls}>${canvasPaths(painted.overlays[name])}</g>`;
    })
    .join('');

  const title = `${world.name} – Day ${latest.day}: ${latest.title}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="${WIDTH}" height="${height}" role="img" aria-labelledby="t d" shape-rendering="crispEdges">`,
    `<title id="t">${escapeXml(title)}</title>`,
    `<desc id="d">${escapeXml(latest.lore)}</desc>`,
    animated ? `<style>${STYLE}</style>` : '',
    `<g transform="scale(${scale})">`,
    canvasPaths(painted.base),
    overlays,
    '</g>',
    caption,
    '</svg>',
    '',
  ].join('\n');
}
