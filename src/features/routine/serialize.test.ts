import { describe, expect, it } from 'vitest';
import { applyDay, createGenesis, parseWorld } from '@/features/world';
import { prBody } from './report';
import { serializeWorld } from './serialize';

describe('world.json serialisation', () => {
  const { world } = applyDay(
    createGenesis('2026-09-28'),
    { action: 'land', x: 30, y: 31, source: 'director' },
    '2026-09-29',
  );

  it('round-trips', () => {
    expect(parseWorld(JSON.parse(serializeWorld(world)))).toEqual(world);
  });

  it('puts every log entry on its own line', () => {
    const lines = serializeWorld(world).split('\n');
    expect(lines.filter((l) => l.includes('"action":')).length).toBe(2);
  });
});

describe('daily PR body', () => {
  it('fills every section the PR guard checks', () => {
    const body = prBody(createGenesis('2026-09-28'));
    for (const heading of [
      '## Was ist passiert (Klartext)',
      '## Doku-Entscheidung',
      '## Plan-Pflicht',
      '## Nachweis',
      '## Dateigrößen',
    ]) {
      expect(body).toContain(heading);
    }
    expect(body).toMatch(/^- `verify`: grün/m);
  });
});
