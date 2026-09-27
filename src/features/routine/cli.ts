import { parseArgs } from 'node:util';
import {
  applyDay,
  berlinDate,
  createGenesis,
  isAction,
  isIsoDate,
  recommend,
  validateWorld,
  WorldContext,
  WorldRuleError,
  type DayChoice,
} from '@/features/world';
import { PATHS, readWorld, staleFiles, worldExists, writeWorld } from './files';
import { commitMessage, plan, prBody, status } from './report';

/**
 * The daily routine's toolbox. Claude calls these commands; the code guarantees the rules.
 *
 *   npm run day -- status            is today's change already there?
 *   npm run day -- plan              island summary + every legal option + a recommendation
 *   npm run day -- apply --action house --x 31 --y 29 --lore "…"
 *   npm run day -- auto              let the rule-based director decide
 *   npm run day -- check             validate world.json and the generated files
 *   npm run day -- render            regenerate isle.svg, LOGBOOK.md, RULES.md
 *   npm run day -- pr-body           body for today's pull request
 *   npm run day -- commit-message    "Day 42: …" + lore
 *   npm run day -- genesis --date YYYY-MM-DD   create a brand-new world (once)
 */

const EXIT_ALREADY_DONE = 3;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    date: { type: 'string' },
    action: { type: 'string' },
    x: { type: 'string' },
    y: { type: 'string' },
    role: { type: 'string' },
    name: { type: 'string' },
    title: { type: 'string' },
    lore: { type: 'string' },
    variant: { type: 'string' },
    'image-url': { type: 'string' },
    verify: { type: 'string' },
    force: { type: 'boolean', default: false },
  },
});

const print = (value: unknown) => process.stdout.write(`${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}\n`);
const fail = (message: string, code = 1): never => {
  process.stderr.write(`✗ ${message}\n`);
  process.exit(code);
};

function today(): string {
  const date = values.date ?? berlinDate();
  if (!isIsoDate(date)) fail(`--date must be YYYY-MM-DD, got "${date}"`);
  return date;
}

function int(name: 'x' | 'y' | 'variant'): number | undefined {
  const raw = values[name];
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n)) fail(`--${name} must be a whole number`);
  return n;
}

function commit(choice: DayChoice, date: string) {
  const world = readWorld();
  if (status(world, date).done) fail(`Day for ${date} is already recorded – nothing to do.`, EXIT_ALREADY_DONE);
  try {
    const result = applyDay(world, choice, date);
    const files = writeWorld(result.world);
    print({
      day: result.entry.day,
      date: result.entry.date,
      action: result.entry.action,
      title: result.entry.title,
      lore: result.entry.lore,
      source: result.entry.source,
      commitMessage: commitMessage(result.world),
      files,
    });
  } catch (error) {
    if (error instanceof WorldRuleError) fail(`rule: ${error.message}`, 2);
    throw error;
  }
}

const command = positionals[0] ?? 'help';

switch (command) {
  case 'status':
    print(status(readWorld(), today()));
    break;

  case 'plan':
    print(plan(readWorld(), today()));
    break;

  case 'apply': {
    const action = values.action ?? '';
    if (!isAction(action)) fail(`--action must be one of the world's actions, got "${action}"`);
    const x = int('x');
    const y = int('y');
    if (x === undefined || y === undefined) fail('--x and --y are required');
    commit(
      {
        action: action as DayChoice['action'],
        x: x as number,
        y: y as number,
        role: values.role,
        name: values.name,
        title: values.title,
        lore: values.lore,
        variant: int('variant'),
        source: 'claude',
      },
      today(),
    );
    break;
  }

  case 'auto': {
    const date = today();
    const world = readWorld();
    const s = status(world, date);
    if (s.done) fail(`Day for ${date} is already recorded – nothing to do.`, EXIT_ALREADY_DONE);
    const pick = recommend(new WorldContext(world), s.day);
    commit({ action: pick.action, x: pick.x, y: pick.y, role: pick.role, name: pick.name, source: 'director' }, date);
    break;
  }

  case 'render': {
    const files = writeWorld(readWorld());
    print(files.length ? `updated: ${files.join(', ')}` : 'everything up to date');
    break;
  }

  case 'check': {
    if (!worldExists()) fail(`${PATHS.world} is missing – run "npm run day -- genesis --date YYYY-MM-DD" once`);
    const world = readWorld();
    const problems = validateWorld(world);
    const stale = staleFiles(world);
    if (stale.length) problems.push(`out of date: ${stale.join(', ')} – run "npm run world:render"`);
    if (problems.length) fail(`world check failed:\n  - ${problems.join('\n  - ')}`);
    print(`world ok – day ${world.days[world.days.length - 1]?.day}, ${world.elements.length} elements, generated files up to date`);
    break;
  }

  case 'pr-body':
    print(prBody(readWorld(), { imageUrl: values['image-url'], verify: values.verify }));
    break;

  case 'commit-message':
    print(commitMessage(readWorld()).trimEnd());
    break;

  case 'genesis': {
    if (worldExists() && !values.force) fail(`${PATHS.world} already exists – genesis happens only once (use --force to overwrite)`);
    const date = today();
    const files = writeWorld(createGenesis(date));
    print({ genesis: date, files });
    break;
  }

  default:
    print(
      [
        'usage: npm run day -- <command> [options]',
        '',
        '  status | plan | apply | auto | check | render | pr-body | commit-message | genesis',
        '',
        '  --date YYYY-MM-DD   pretend it is this day (default: today in Europe/Berlin)',
        '  apply: --action <type> --x <n> --y <n> [--role <trade|species>] [--name <name>]',
        '         [--title "<title>"] [--lore "<one line>"] [--variant <n>]',
      ].join('\n'),
    );
    if (command !== 'help') process.exit(1);
}
