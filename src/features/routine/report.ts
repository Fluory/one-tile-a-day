import {
  CATALOGUE,
  daysBetween,
  describePlace,
  formatDate,
  options,
  recommend,
  seasonOf,
  WorldContext,
  worldStats,
  type DayEntry,
  type World,
} from '@/features/world';

/** What the routine needs to know before it decides anything. */
export function status(world: World, date: string) {
  const last = world.days[world.days.length - 1] as DayEntry;
  return {
    today: date,
    day: daysBetween(world.genesis, date),
    season: seasonOf(date),
    lastDay: last.day,
    lastDate: last.date,
    /** true → today's change already exists, the routine must stop without changes. */
    done: last.date >= date,
  };
}

/** The decision sheet for Claude: state of the island, recent days, every legal option. */
export function plan(world: World, date: string) {
  const ctx = new WorldContext(world);
  const s = status(world, date);
  const stats = worldStats(world);
  const recommendation = recommend(ctx, s.day);
  return {
    ...s,
    island: {
      land: stats.land,
      meadows: stats.meadows,
      forest: stats.forest,
      rock: stats.rock,
      trees: stats.trees,
      houses: stats.houses,
      inhabitants: stats.inhabitants,
      animals: stats.animals,
    },
    people: ctx.of('inhabitant').map((p) => ({
      name: p.name,
      trade: p.role,
      home: describePlace(ctx, p.x, p.y).name,
      since: p.day,
    })),
    recent: world.days.slice(-7).map((d) => ({ day: d.day, title: d.title, lore: d.lore })),
    options: options(ctx, s.day).map((o) => ({
      action: o.action,
      label: o.label,
      rule: CATALOGUE[o.action].rule,
      weight: o.weight,
      legalTiles: o.tiles,
      suggestions: o.suggestions.map((sg) => ({
        x: sg.x,
        y: sg.y,
        place: sg.place.at,
        ...(sg.role ? { role: sg.role } : {}),
        ...(sg.name ? { name: sg.name } : {}),
      })),
    })),
    recommendation: {
      action: recommendation.action,
      x: recommendation.x,
      y: recommendation.y,
      place: recommendation.place.at,
      ...(recommendation.role ? { role: recommendation.role } : {}),
      ...(recommendation.name ? { name: recommendation.name } : {}),
    },
  };
}

export function commitMessage(world: World): string {
  const last = world.days[world.days.length - 1] as DayEntry;
  return `Day ${last.day}: ${last.title}\n\n${last.lore}\n`;
}

/**
 * Body of the daily pull request. Follows .github/PULL_REQUEST_TEMPLATE.md so that
 * scripts/pr-check.sh accepts it (headings stay in the template's language).
 */
export function prBody(world: World, options: { imageUrl?: string; verify?: string } = {}): string {
  const last = world.days[world.days.length - 1] as DayEntry;
  const stats = worldStats(world);
  const who = last.source === 'claude' ? 'Claude hat die Änderung ausgewählt und die Lore geschrieben' : 'Der regelbasierte Director hat die Änderung automatisch gewählt';
  const label = last.action === 'genesis' ? 'Genesis' : CATALOGUE[last.action].label;
  return [
    '## Warum',
    '',
    `Tägliche Routine ([ROUTINE.md](../blob/main/ROUTINE.md)) – **Day ${last.day}** (${formatDate(last.date)}). Kein Issue: die Routine selbst ist der wiederkehrende Auftrag.`,
    '',
    '## Was ist passiert (Klartext)',
    '',
    `Die Insel ist heute um genau ein Element gewachsen: **${label}** – „${last.title}“. ${who}; die Weltregeln wurden vom Code geprüft. Die Insel hat jetzt ${stats.land} Felder Land, ${stats.houses} Häuser und ${stats.inhabitants} Bewohner.`,
    '',
    `> ${last.lore}`,
    '',
    ...(options.imageUrl ? [`![Day ${last.day}](${options.imageUrl})`, ''] : []),
    '## Plan-Pflicht (SYSTEM.md §4)',
    '',
    '- [x] Kein Auslöser – keine Modulgrenze, öffentliche API, Migration, Auth/Rechte, kein Zahlungs-/Daten-/Infrapfad, höchstens zwei Module, keine Architekturvarianten, umkehrbar',
    '- [ ] Auslöser zutreffend – Impact Manifest ausgefüllt (Plan vor Code)',
    '',
    '## Geändert',
    '',
    '- `world/world.json`: ein Tag, eine Änderung',
    '- `world/isle.svg`, `LOGBOOK.md`: daraus neu erzeugt',
    '',
    '## Nachweis (SYSTEM.md §11)',
    '',
    '- `verify:changed`: grün – `npm run world:check`',
    `- \`verify\`: ${options.verify ?? 'grün – lokal `npm run verify`'}`,
    '- `verify:full` / E2E-Spec: nicht betroffen (nur Weltdaten)',
    '',
    '## Doku-Entscheidung (genau eine)',
    '',
    '- [x] Keine langlebige Doku betroffen – Begründung: tägliche Weltdaten, LOGBOOK.md wird generiert',
    '- [ ] Doku betroffen und im selben PR aktualisiert:',
    '',
    'Entferntes oder Umbenanntes: nichts entfernt',
    '',
    '## Dateigrößen und neue Bausteine (SYSTEM.md §7)',
    '',
    'Dateien über 500 Zeilen im Diff (Ausnahmen: generierter Code, Lockfiles, Fixtures, Migrationen, Schemas, Ressourcen, Doku, Konfiguration):',
    '- [x] keine',
    '',
    'Über 800 Zeilen mit neuer Fachlogik oder über 1000 Zeilen (P1/P2): nicht betroffen',
    '',
    'Neue Shared-Komponente, Utility-Datei, Adapter oder fachlicher Service:',
    '- [x] nein',
    '',
    '## Subagent-Einsätze',
    '',
    'Keine',
    '',
    '## Risiken / offene Punkte',
    '',
    '- Keine – der PR wird nach grüner CI automatisch per Squash gemergt (Ausnahmen-Register in docs/ARCHITEKTUR.md).',
    '',
  ].join('\n');
}
