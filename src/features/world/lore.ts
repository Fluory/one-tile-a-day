import { CATALOGUE, TREE_KINDS, type Action } from './catalogue';
import type { Place } from './places';

/**
 * Fallback titles and lore lines. The daily routine normally lets Claude write the lore;
 * these templates keep the island growing (and readable) when it runs in automatic mode.
 */

export interface LoreInput {
  action: Action;
  place: Place;
  variant: number;
  name?: string;
  role?: string;
  /** For inhabitants: where their house stands. */
  homePlace?: Place;
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'An' : 'A');

export function treeKind(variant: number): string {
  return TREE_KINDS[variant % TREE_KINDS.length] ?? 'tree';
}

export function autoTitle(input: LoreInput): string {
  const { action, place, name, role } = input;
  switch (action) {
    case 'land':
      return `Land rises ${place.at}`;
    case 'meadow':
      return `Grass spreads ${place.at}`;
    case 'rock':
      return `Rocks break through ${place.at}`;
    case 'forest':
      return `A forest grows ${place.at}`;
    case 'inhabitant':
      return role === 'child' ? `${name ?? 'A child'} is born` : `${name ?? 'Someone'} the ${role ?? 'traveller'} arrives`;
    case 'animal': {
      const species = role ?? 'animal';
      return `${article(species)} ${species} ${place.at}`;
    }
    case 'tree': {
      const kind = treeKind(input.variant);
      return `${article(kind)} ${kind} ${place.at}`;
    }
    default:
      return `${CATALOGUE[action].label} ${place.at}`;
  }
}

export function autoLore(input: LoreInput): string {
  const { action, place, name, role, homePlace } = input;
  const at = place.at;
  switch (action) {
    case 'land':
      return `The tide pulls back and a new strip of sand stays behind ${at}.`;
    case 'meadow':
      return `Seeds carried by the wind take hold ${at}; the sand turns green.`;
    case 'rock':
      return `Waves wash the sand away ${at} and uncover old grey rock.`;
    case 'forest':
      return `The trees ${at} have grown so close together that they are a forest now.`;
    case 'tree':
      return `A young ${treeKind(input.variant)} takes root ${at}.`;
    case 'house':
      return `Someone gathers driftwood and stones and builds a small house ${at}.`;
    case 'path':
      return `Many footsteps have worn a path ${at}.`;
    case 'field':
      return `The first furrows are drawn ${at}; something will grow here next summer.`;
    case 'garden':
      return `A little garden with herbs and flowers appears ${at}.`;
    case 'well':
      return `The villagers dig until they hit fresh water ${at}.`;
    case 'jetty':
      return `Planks and posts reach out into the water ${at}.`;
    case 'boat':
      return `A small boat is tied up ${at}, rocking gently.`;
    case 'harbor':
      return `Nets, crates and a proper quay: the island has a harbour ${at}.`;
    case 'lighthouse':
      return `A white tower goes up ${at}; tonight a light will turn over the sea for the first time.`;
    case 'library':
      return `The island's stories finally get a home: a library opens ${at}.`;
    case 'windmill':
      return `A windmill starts turning ${at}; the fields around it will feed everyone.`;
    case 'market':
      return `Stalls and awnings go up ${at} – the island has a market day now.`;
    case 'ruin':
      return `Moss-covered stones ${at} tell of people who lived here long before.`;
    case 'inhabitant':
      if (role === 'child') return `${name ?? 'A child'} is born in the house ${homePlace?.at ?? at}.`;
      return `${name ?? 'A newcomer'}, a ${role ?? 'traveller'}, moves into the house ${homePlace?.at ?? at}.`;
    case 'animal':
      return `${article(role ?? 'animal')} ${role ?? 'animal'} has found its way to the island and settles ${at}.`;
  }
}

const LORE_FORBIDDEN = /(https?:\/\/|www\.|@\w)/i;

/** Lore is one printable line: no links, no mentions, no markup, no line breaks. */
export function checkText(kind: 'title' | 'lore', value: string): string | null {
  const text = value.trim();
  const max = kind === 'title' ? 80 : 200;
  if (text.length < 3) return `${kind} is too short`;
  if (text.length > max) return `${kind} is longer than ${max} characters`;
  if (/[\r\n\t]/.test(text)) return `${kind} must be a single line`;
  if (/[<>`|*_\\[\]{}]/.test(text)) return `${kind} must be plain text (no markdown or HTML)`;
  if (LORE_FORBIDDEN.test(text)) return `${kind} must not contain links or @mentions`;
  if (/\p{Extended_Pictographic}/u.test(text)) return `${kind} must not contain emoji`;
  return null;
}
