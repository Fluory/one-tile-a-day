import { rasterText } from '@/features/render';

/**
 * README banner and social preview: an isometric island assembling itself one tile at a time
 * (CSS keyframes, so it moves inside GitHub's image renderer), next to the title in the island's
 * pixel font. Pure SVG, no fonts, no images.
 */

interface Tile {
  i: number;
  j: number;
  top: string;
  deco?: 'tree' | 'pine' | 'house' | 'lighthouse' | 'windmill';
}

const TILES: Tile[] = [
  { i: 1, j: 1, top: '#ecd49d' },
  { i: 2, j: 1, top: '#6aab45', deco: 'tree' },
  { i: 1, j: 2, top: '#6aab45', deco: 'house' },
  { i: 2, j: 2, top: '#6aab45', deco: 'pine' },
  { i: 0, j: 1, top: '#86818c', deco: 'lighthouse' },
  { i: 3, j: 2, top: '#ecd49d' },
  { i: 2, j: 3, top: '#6aab45', deco: 'windmill' },
  { i: 1, j: 3, top: '#ecd49d' },
  { i: 3, j: 1, top: '#ecd49d' },
];

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  const r = c((n >> 16) & 255);
  const g = c((n >> 8) & 255);
  const b = c(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function textPath(text: string): string {
  const parts: string[] = [];
  rasterText(text, (x, y) => parts.push(`M${x} ${y}h1v1h-1z`));
  return parts.join('');
}

function deco(kind: Tile['deco'], x: number, y: number): string {
  switch (kind) {
    case 'tree':
      return `<rect x="${x - 3}" y="${y - 14}" width="6" height="14" fill="#7a4f2e"/><circle cx="${x}" cy="${y - 22}" r="14" fill="#44913e"/><circle cx="${x - 5}" cy="${y - 26}" r="6" fill="#76b84f"/>`;
    case 'pine':
      return `<rect x="${x - 3}" y="${y - 10}" width="6" height="10" fill="#7a4f2e"/><polygon points="${x},${y - 46} ${x + 15},${y - 10} ${x - 15},${y - 10}" fill="#2f6e45"/><polygon points="${x},${y - 46} ${x + 15},${y - 10} ${x},${y - 10}" fill="#1e4f35"/>`;
    case 'house':
      return `<rect x="${x - 14}" y="${y - 20}" width="28" height="20" fill="#f2e6c9"/><rect x="${x}" y="${y - 20}" width="14" height="20" fill="#d8c6a4"/><polygon points="${x - 17},${y - 20} ${x},${y - 36} ${x + 17},${y - 20}" fill="#c95a3c"/><rect x="${x - 9}" y="${y - 14}" width="6" height="6" fill="#ffd96a"/><rect x="${x + 4}" y="${y - 12}" width="5" height="12" fill="#6b4128"/>`;
    case 'lighthouse':
      return `<rect x="${x - 8}" y="${y - 50}" width="16" height="50" fill="#fbfaf5"/><rect x="${x - 8}" y="${y - 40}" width="16" height="7" fill="#d3423a"/><rect x="${x - 8}" y="${y - 22}" width="16" height="7" fill="#d3423a"/><rect x="${x - 10}" y="${y - 56}" width="20" height="6" fill="#3b3f4a"/><rect x="${x - 5}" y="${y - 64}" width="10" height="8" fill="#ffd96a" class="lamp"/><polygon points="${x - 9},${y - 64} ${x},${y - 74} ${x + 9},${y - 64}" fill="#d3423a"/>`;
    case 'windmill':
      return `<rect x="${x - 8}" y="${y - 34}" width="16" height="34" fill="#f2e6c9"/><polygon points="${x - 10},${y - 34} ${x},${y - 46} ${x + 10},${y - 34}" fill="#c95a3c"/><g class="sails" style="transform-origin:${x}px ${y - 36}px"><rect x="${x - 1.5}" y="${y - 60}" width="3" height="48" fill="#fbfaf5"/><rect x="${x - 24}" y="${y - 37.5}" width="48" height="3" fill="#fbfaf5"/></g>`;
    default:
      return '';
  }
}

export function bannerSvg(options: { width?: number; height?: number; animated?: boolean } = {}): string {
  const width = options.width ?? 1280;
  const height = options.height ?? 400;
  const animated = options.animated ?? true;
  const seaY = Math.round(height * 0.72);
  const W = 76;
  const H = 38;
  const D = 22;
  const ox = width - 330;
  const oy = seaY - 96;
  const loop = 14;

  const sorted = [...TILES].map((t, order) => ({ ...t, order })).sort((a, b) => a.i + a.j - (b.i + b.j) || a.i - b.i);
  const keyframes: string[] = [];
  const tiles = sorted.map((t) => {
    const x = ox + (t.i - t.j) * (W / 2);
    const y = oy + (t.i + t.j) * (H / 2);
    const start = (4 + t.order * 7) / 100;
    const name = `t${t.order}`;
    keyframes.push(
      `@keyframes ${name}{0%,${(start * 100).toFixed(1)}%{transform:translateY(90px);opacity:0}${((start + 0.05) * 100).toFixed(1)}%{transform:translateY(-8px);opacity:1}${((start + 0.08) * 100).toFixed(1)}%,90%{transform:translateY(0);opacity:1}97%,100%{transform:translateY(0);opacity:0}}`,
    );
    const top = `<polygon points="${x},${y} ${x + W / 2},${y + H / 2} ${x},${y + H} ${x - W / 2},${y + H / 2}" fill="${t.top}"/>`;
    const left = `<polygon points="${x - W / 2},${y + H / 2} ${x},${y + H} ${x},${y + H + D} ${x - W / 2},${y + H / 2 + D}" fill="${shade(t.top, 0.82)}"/>`;
    const right = `<polygon points="${x},${y + H} ${x + W / 2},${y + H / 2} ${x + W / 2},${y + H / 2 + D} ${x},${y + H + D}" fill="${shade(t.top, 0.66)}"/>`;
    const style = animated ? ` style="animation:${name} ${loop}s cubic-bezier(.22,1,.36,1) infinite"` : '';
    return `<g${style}>${left}${right}${top}${deco(t.deco, x, y + H / 2)}</g>`;
  });

  const waves: string[] = [];
  const wavesB: string[] = [];
  for (let n = 0; n < 34; n++) {
    const wx = (n * 97) % width;
    const wy = seaY + 20 + ((n * 53) % Math.max(20, height - seaY - 30));
    waves.push(`<rect x="${wx}" y="${wy}" width="18" height="4" fill="#7fd0d4"/>`);
    wavesB.push(`<rect x="${wx + 6}" y="${wy}" width="18" height="4" fill="#7fd0d4"/>`);
  }

  const title = height >= 600 ? 8 : 6;
  const top = Math.round(height * (height >= 600 ? 0.2 : 0.13));
  const gap = height >= 600 ? 18 : 12;
  const style = [
    ...keyframes,
    '.wa{animation:wa 1.8s steps(1) infinite}.wb{animation:wb 1.8s steps(1) infinite}',
    '@keyframes wa{0%{opacity:1}50%{opacity:0}}@keyframes wb{0%{opacity:0}50%{opacity:1}}',
    '.lamp{animation:lamp 2.4s steps(1) infinite}@keyframes lamp{0%{fill:#fff3b0}55%{fill:#c9a93f}}',
    '.sails{animation:spin 6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}',
    '.cursor{animation:wa 1.1s steps(1) infinite}',
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
  ].join('');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="One Tile a Day – an island that grows by exactly one tile every day">`,
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4dfc4"/><stop offset="1" stop-color="#d3e7ea"/></linearGradient>',
    '<radialGradient id="sun" cx=".82" cy=".1" r=".5"><stop offset="0" stop-color="#ffd96a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd96a" stop-opacity="0"/></radialGradient>',
    '<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fa6b8"/><stop offset="1" stop-color="#1d5a7a"/></linearGradient></defs>',
    animated ? `<style>${style}</style>` : '',
    `<rect width="${width}" height="${height}" fill="url(#sky)"/><rect width="${width}" height="${height}" fill="url(#sun)"/>`,
    `<rect y="${seaY}" width="${width}" height="${height - seaY}" fill="url(#sea)"/>`,
    `<rect y="${seaY}" width="${width}" height="3" fill="#e8f7f2" opacity=".8"/>`,
    `<g class="${animated ? 'wa' : ''}">${waves.join('')}</g>`,
    animated ? `<g class="wb">${wavesB.join('')}</g>` : '',
    `<ellipse cx="${ox}" cy="${seaY + 26}" rx="190" ry="34" fill="#e8f7f2" opacity=".35"/>`,
    ...tiles,
    `<path transform="translate(72 ${top}) scale(${title})" fill="#10212f" d="${textPath('ONE TILE')}"/>`,
    `<path transform="translate(72 ${top + 8 * title + gap}) scale(${title})" fill="#ff6b57" d="${textPath('A DAY')}"/>`,
    `<rect class="${animated ? 'cursor' : ''}" x="${72 + 32 * title}" y="${top + 8 * title + gap}" width="${5 * title}" height="${7 * title}" fill="#ff6b57" opacity=".85"/>`,
    `<path transform="translate(74 ${top + 16 * title + gap * 2 + 12}) scale(3)" fill="#3a5063" d="${textPath('AN ISLAND THAT GROWS')}"/>`,
    `<path transform="translate(74 ${top + 16 * title + gap * 2 + 42}) scale(3)" fill="#3a5063" d="${textPath('BY EXACTLY ONE TILE EVERY DAY')}"/>`,
    `<path transform="translate(74 ${top + 16 * title + gap * 2 + 78}) scale(2)" fill="#6a7f8f" d="${textPath('GROWN BY A CLAUDE ROUTINE · ONE COMMIT A DAY · OPEN SOURCE')}"/>`,
    '</svg>',
    '',
  ].join('\n');
}
