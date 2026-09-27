import { describe, expect, it } from 'vitest';
import { applyDay, createGenesis } from '@/features/world';
import { renderIsleSvg } from './svg';

describe('isle.svg', () => {
  const genesis = createGenesis('2026-09-28');

  it('is deterministic', () => {
    expect(renderIsleSvg(genesis)).toBe(renderIsleSvg(genesis));
  });

  it('describes the day for screen readers', () => {
    const svg = renderIsleSvg(genesis);
    expect(svg).toContain('<title id="t">One Tile a Day – Day 0: A sandbank in the open sea</title>');
    expect(svg).toContain('role="img"');
  });

  it('marks the newest tile and can be rendered without animation', () => {
    const { world } = applyDay(genesis, { action: 'land', x: 30, y: 31, source: 'director' }, '2026-09-29');
    expect(renderIsleSvg(world)).toContain('class="mark"');
    expect(renderIsleSvg(world, { animated: false })).not.toContain('<style>');
  });

  it('escapes lore text', () => {
    const { world } = applyDay(
      genesis,
      { action: 'land', x: 30, y: 31, lore: 'Sand & salt, "calm" water.', source: 'claude' },
      '2026-09-29',
    );
    expect(renderIsleSvg(world)).toContain('Sand &amp; salt, &quot;calm&quot; water.');
  });
});
