import { CATALOGUE, formatDate, formatMonth, worldStats, type DayEntry, type World } from '@/features/world';

/**
 * LOGBOOK.md – the island's chronicle, newest day first, one line per day.
 * Generated from world.json; never edit it by hand.
 */

function icon(entry: DayEntry): string {
  if (entry.action === 'genesis') return '🌊';
  return CATALOGUE[entry.action].emoji;
}

function line(entry: DayEntry): string {
  const [, , d] = entry.date.split('-');
  const month = formatDate(entry.date).split(' ')[1];
  const auto = entry.source === 'director' ? ' <sub>· auto</sub>' : '';
  return `- **Day ${entry.day}** · ${Number(d)} ${month} · ${icon(entry)} **${entry.title}** — ${entry.lore}${auto}`;
}

export function renderLogbook(world: World): string {
  const stats = worldStats(world);
  const out: string[] = [
    '# Logbook',
    '',
    `> The chronicle of **${world.name}**, newest day first – one line per day, written by the daily routine`,
    '> ([ROUTINE.md](ROUTINE.md)). The single source of truth is [`world/world.json`](world/world.json);',
    '> this file is generated from it. Days marked *auto* were decided by the rule-based director instead of Claude.',
    '',
    `**Day ${stats.day}** · ${stats.land} tiles of land · ${stats.houses} houses · ${stats.inhabitants} inhabitants · ${stats.animals} animals · founded ${formatDate(world.genesis)}`,
  ];
  let month = '';
  for (const entry of [...world.days].reverse()) {
    const m = formatMonth(entry.date);
    if (m !== month) {
      month = m;
      out.push('', `## ${m}`, '');
    }
    out.push(line(entry));
  }
  out.push('');
  return out.join('\n');
}
