import type { Rng } from './rng';

/**
 * Short, fictional-sounding first names from many languages. The routine may choose its own
 * names; this list is the deterministic fallback and a source of inspiration.
 */
export const NAMES = [
  'Mara', 'Ilo', 'Tove', 'Juno', 'Pim', 'Ada', 'Kofi', 'Nell', 'Oona', 'Rafi',
  'Lio', 'Sami', 'Edda', 'Taro', 'Wren', 'Yara', 'Bo', 'Iris', 'Otto', 'Luca',
  'Mika', 'Noor', 'Pia', 'Sol', 'Tamsin', 'Ueli', 'Vida', 'Zev', 'Ansel', 'Brisa',
  'Cai', 'Dagny', 'Emeka', 'Fenna', 'Gus', 'Hana', 'Ines', 'Jory', 'Kaia', 'Linnea',
  'Milo', 'Nika', 'Oskar', 'Priya', 'Quinn', 'Runa', 'Selin', 'Teo', 'Umi', 'Vesna',
  'Wim', 'Xenia', 'Yusuf', 'Zora', 'Arvo', 'Bea', 'Coen', 'Dilan', 'Elif', 'Farid',
  'Greta', 'Hugo', 'Isla', 'Jonah', 'Kira', 'Leif', 'Mateo', 'Nia', 'Ola', 'Petra',
] as const;

const NAME_PATTERN = /^[\p{L}][\p{L}' -]{0,22}[\p{L}]$/u;

export function isValidName(name: string): boolean {
  return NAME_PATTERN.test(name.trim());
}

/** A name nobody on the island carries yet (falls back to numbered names when the list runs out). */
export function pickName(rng: Rng, taken: ReadonlySet<string>): string {
  const free = NAMES.filter((n) => !taken.has(n));
  if (free.length > 0) return free[Math.floor(rng() * free.length)] as string;
  let i = 2;
  for (;;) {
    for (const base of NAMES) {
      const candidate = `${base} ${toRoman(i)}`;
      if (!taken.has(candidate)) return candidate;
    }
    i++;
  }
}

function toRoman(n: number): string {
  const numerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let rest = n;
  let out = '';
  for (const [value, numeral] of numerals) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return out;
}
