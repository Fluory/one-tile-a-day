import type { DayEntry, Element, World } from '@/features/world';

/**
 * Stable, diff-friendly JSON for world.json: one terrain row, element or day per line, keys
 * in a fixed order. A daily commit therefore shows up as one changed map character (or one
 * new element line) plus one new log line.
 */

const ELEMENT_KEYS: (keyof Element)[] = ['id', 'day', 'type', 'x', 'y', 'variant', 'name', 'role', 'home'];
const DAY_KEYS: (keyof DayEntry)[] = [
  'day',
  'date',
  'action',
  'x',
  'y',
  'title',
  'lore',
  'source',
  'terrain',
  'element',
];

function ordered<T extends object>(value: T, keys: readonly (keyof T)[]): string {
  const parts: string[] = [];
  for (const k of keys) {
    const v = value[k];
    if (v !== undefined) parts.push(`${JSON.stringify(k)}:${JSON.stringify(v)}`);
  }
  return `{${parts.join(',')}}`;
}

function list(items: string[]): string {
  return items.length === 0 ? '[]' : `[\n    ${items.join(',\n    ')}\n  ]`;
}

export function serializeWorld(world: World): string {
  return [
    '{',
    `  "version": ${world.version},`,
    `  "name": ${JSON.stringify(world.name)},`,
    `  "genesis": ${JSON.stringify(world.genesis)},`,
    `  "width": ${world.width},`,
    `  "height": ${world.height},`,
    `  "terrain": ${list(world.terrain.map((r) => JSON.stringify(r)))},`,
    `  "elements": ${list(world.elements.map((e) => ordered(e, ELEMENT_KEYS)))},`,
    `  "days": ${list(world.days.map((d) => ordered(d, DAY_KEYS)))}`,
    '}',
    '',
  ].join('\n');
}
