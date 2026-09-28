import { seasonOf, type Season } from './calendar';
import { WorldContext } from './context';
import type { DayEntry, World } from './schema';

export interface WorldStats {
  day: number;
  date: string;
  season: Season;
  land: number;
  meadows: number;
  forest: number;
  rock: number;
  trees: number;
  houses: number;
  inhabitants: number;
  animals: number;
  buildings: number;
  latest: DayEntry;
}

export function worldStats(world: World): WorldStats {
  const ctx = new WorldContext(world);
  const latest = world.days[world.days.length - 1] as DayEntry;
  const buildings = ctx.world.elements.filter((e) =>
    ['house', 'well', 'harbor', 'lighthouse', 'library', 'windmill', 'market'].includes(e.type),
  ).length;
  return {
    day: latest.day,
    date: latest.date,
    season: seasonOf(latest.date),
    land: ctx.land,
    meadows: ctx.terrainCount('grass'),
    forest: ctx.terrainCount('forest'),
    rock: ctx.terrainCount('rock'),
    trees: ctx.count('tree'),
    houses: ctx.count('house'),
    inhabitants: ctx.count('inhabitant'),
    animals: ctx.count('animal'),
    buildings,
    latest,
  };
}
