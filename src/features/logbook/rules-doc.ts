import { ACTIONS, CATALOGUE, MAP_MARGIN, ROLES, SPECIES, type Action } from '@/features/world';

/** RULES.md – generated from the catalogue so the prose can never drift from the code. */
export function renderRulesDoc(): string {
  const section = (category: 'ground' | 'structure' | 'life') =>
    ACTIONS.filter((a: Action) => CATALOGUE[a].category === category).map(
      (a: Action) => `| ${CATALOGUE[a].emoji} | **${CATALOGUE[a].label}** | ${CATALOGUE[a].rule} |`,
    );
  return [
    '# World rules',
    '',
    '> Generated from [`src/features/world/catalogue.ts`](src/features/world/catalogue.ts). The code in',
    '> [`rules.ts`](src/features/world/rules.ts) enforces exactly these sentences – change both together,',
    '> then run `npm run world:render`.',
    '',
    'The island grows by **exactly one change per calendar day** (Europe/Berlin). A change is a piece of',
    '**ground** (the terrain of one tile changes), a **structure** that occupies a tile, or **life** that',
    'settles on the island. Elements depend on each other, so the island develops believably instead of randomly.',
    '',
    '## Ground',
    '',
    '| | Change | Rule |',
    '|---|---|---|',
    ...section('ground'),
    '',
    '## Structures',
    '',
    '| | Structure | Rule |',
    '|---|---|---|',
    ...section('structure'),
    '',
    '## Life',
    '',
    '| | Who | Rule |',
    '|---|---|---|',
    ...section('life'),
    '',
    `**Trades:** ${ROLES.join(', ')}.`,
    '',
    `**Species:** ${SPECIES.join(', ')}.`,
    '',
    '## Always',
    '',
    '- One change per calendar day, never two. If the routine runs twice, the second run changes nothing.',
    `- The map is 64 × 64 tiles; a margin of ${MAP_MARGIN} tiles along the edge stays open sea.`,
    '- Every change gets a title and one line of lore: plain text, no links, no @mentions, no real people or brands.',
    '- Everything visible is drawn from the seasonal palettes in `src/features/render/palette.ts` – no outside images.',
    '',
  ].join('\n');
}
