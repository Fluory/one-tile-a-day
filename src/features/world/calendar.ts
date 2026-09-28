/**
 * Calendar helpers. The island lives in Heilbronn time (Europe/Berlin): the routine runs
 * at 08:47 local time and a "day" is a calendar day there, not in UTC.
 */

export const TIME_ZONE = 'Europe/Berlin';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Today's date in Europe/Berlin as YYYY-MM-DD. */
export function berlinDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function toUtcMidnight(date: string): number {
  if (!isIsoDate(date)) throw new Error(`Invalid date "${date}" – expected YYYY-MM-DD`);
  return Date.parse(`${date}T00:00:00Z`);
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMidnight(to) - toUtcMidnight(from)) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  return new Date(toUtcMidnight(date) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Meteorological seasons (northern hemisphere). */
export function seasonOf(date: string): Season {
  const month = Number(date.slice(5, 7));
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "28 Sep 2026" */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]} ${y}`;
}

/** "September 2026" */
export function formatMonth(date: string): string {
  const [y, m] = date.split('-').map(Number);
  return `${MONTHS_LONG[(m ?? 1) - 1]} ${y}`;
}
