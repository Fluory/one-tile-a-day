import type { ColorKey } from './palette';

/**
 * Hand-drawn 8-pixel-wide sprites. Each string is one row, the last row sits on the bottom
 * edge of the tile, taller sprites reach up into the tile above. `.` is transparent.
 */
export type Sprite = readonly string[];

export const LEGEND: Record<string, ColorKey> = {
  S: 'shadow',
  k: 'ink',
  w: 'white',
  x: 'red',
  m: 'metal',
  y: 'light',
  t: 'trunk',
  T: 'trunk0',
  a: 'leaf0',
  b: 'leaf1',
  c: 'leaf2',
  p: 'accent',
  P: 'pine0',
  Q: 'pine1',
  r: 'roof1',
  R: 'roof0',
  v: 'wall1',
  W: 'wall0',
  d: 'door',
  o: 'wood1',
  O: 'wood0',
  s: 'stone1',
  z: 'stone0',
  f: 'soil0',
  F: 'soil1',
  h: 'crop0',
  H: 'crop1',
  n: 'awning',
  u: 'sail',
  l: 'cloth',
  q: 'skin',
  j: 'hair',
  '1': 'flower1',
  '2': 'flower2',
  '3': 'flower3',
  g: 'grass2',
  G: 'grass0',
  e: 'sea3',
  A: 'fur0',
  B: 'fur1',
  N: 'snow',
};

export const TREES: Record<'oak' | 'pine' | 'birch' | 'apple' | 'bare' | 'snowPine', Sprite> = {
  oak: [
    '..abba..',
    '.abccba.',
    'abcccbba',
    'abbcbbba',
    'aabbbbaa',
    '.aabbaa.',
    '..aaaa..',
    '...tT...',
    '...tT...',
    '..SSSS..',
  ],
  pine: [
    '...QP...',
    '..QQPP..',
    '...QP...',
    '..QQPP..',
    '.QQQPPP.',
    '..QQPP..',
    '.QQQPPP.',
    'QQQQPPPP',
    '...tT...',
    '..SSSS..',
  ],
  birch: [
    '..bcb...',
    '.bccbb..',
    '.bcbbba.',
    '..bbbaa.',
    '..abaa..',
    '...wk...',
    '...wk...',
    '...kw...',
    '...ww...',
    '..SSSS..',
  ],
  apple: [
    '..abba..',
    '.abcpba.',
    'abpccbba',
    'abbcbpba',
    'aapbbbaa',
    '.aabbaa.',
    '..aaaa..',
    '...tT...',
    '...tT...',
    '..SSSS..',
  ],
  bare: [
    '..N.N.N.',
    '.tTNtTt.',
    't.tTt.T.',
    '.TtTtTt.',
    '..tTtT..',
    '...tT...',
    '...tT...',
    '...tT...',
    '...tT...',
    '..SSSS..',
  ],
  snowPine: [
    '...NN...',
    '..NQPP..',
    '...QP...',
    '..NNPP..',
    '.QQQPPP.',
    '..NNNP..',
    '.QQQPPP.',
    'QQQQPPPP',
    '...tT...',
    '..SSSS..',
  ],
};

export const HOUSE: Sprite = [
  '.....z..',
  '..RRRzR.',
  '.RrrrrrR',
  'RrrrrrrR',
  'RRRRRRRR',
  '.vvvvvW.',
  '.vyvdvW.',
  '.vyvdvW.',
  '.WWWdWW.',
  'SSSSSSSS',
];

export const LIGHTHOUSE: Sprite = [
  '...yy...',
  '..myym..',
  '..mmmm..',
  '.mmmmmm.',
  '..wwww..',
  '..xxxx..',
  '..wwww..',
  '..wwww..',
  '..xxxx..',
  '..wwww..',
  '.wwwwww.',
  '.xxxxxx.',
  '.wwwwww.',
  '.WWdWWW.',
  'SSSSSSSS',
];

export const WINDMILL: Sprite = [
  '........',
  '........',
  '........',
  '........',
  '...RR...',
  '..RrrR..',
  '..vvvW..',
  '..vvvW..',
  '.vvvvWW.',
  '.vvdvWW.',
  '.vvdvWW.',
  '.WWWWWW.',
  'SSSSSSSS',
];

/** Windmill sails, two frames, drawn over the top rows of WINDMILL. */
export const SAILS_A: Sprite = ['...w....', '...w....', '...w....', 'wwwowww.', '...w....', '...w....', '...w....'];
export const SAILS_B: Sprite = ['w.....w.', '.w...w..', '..w.w...', '...o....', '..w.w...', '.w...w..', 'w.....w.'];

export const LIBRARY: Sprite = [
  '..RRRR..',
  '.RrrrrR.',
  'RrrrrrrR',
  'zzzzzzzz',
  'sysssyss',
  'sysssyss',
  'sszddzss',
  'zzzddzzz',
  'SSSSSSSS',
];

export const MARKET: Sprite = [
  'nwnwnwnw',
  'wnwnwnwn',
  '.O....O.',
  '.O2x1hO.',
  '.OooooO.',
  '.OOOOOO.',
  '.O....O.',
  'SSSSSSSS',
];

export const HARBOR: Sprite = [
  'ssssssss',
  'sOoOszss',
  'sOoOsmms',
  'sssssmms',
  'ssssssss',
  'zszszszs',
  'ssssssss',
  'zzzzzzzz',
];

export const JETTY_V: Sprite = [
  '..oOoO..',
  '..OoOo..',
  '..oOoO..',
  '.TOoOoT.',
  '..oOoO..',
  '..OoOo..',
  '.ToOoOT.',
  '..e..e..',
];

export const JETTY_H: Sprite = [
  '........',
  '.T....T.',
  'oOoOoOoO',
  'OoOoOoOo',
  'oOoOoOoO',
  'OoOoOoOo',
  '.T....T.',
  '.e....e.',
];

export const BOAT: Sprite = [
  '...u....',
  '...uu...',
  '...uuu..',
  '...uuuu.',
  '...k....',
  'OoooooO.',
  '.OOOOO..',
  '..eeee..',
];

export const WELL: Sprite = [
  '..RRRR..',
  '.RrrrrR.',
  '.o....o.',
  '.o.k..o.',
  '.o.m..o.',
  'zssssssz',
  'zseeeesz',
  'zzzzzzzz',
  'SSSSSSSS',
];

export const FIELDS: readonly Sprite[] = [
  ['hHhHhHhH', 'ffffffff', 'HhHhHhHh', 'FFFFFFFF', 'hHhHhHhH', 'ffffffff', 'HhHhHhHh', 'FFFFFFFF'],
  ['fFfFfFfF', 'bcfbcfbc', 'abfabfab', 'FfFfFfFf', 'fFfFfFfF', 'bcfbcfbc', 'abfabfab', 'FfFfFfFf'],
];

export const GARDENS: readonly Sprite[] = [
  ['........', '.1.2.3..', 'b1b2b3b.', '.b.b.b..', 'o.o.o.o.', 'oooooooo', '........', '........'],
  ['........', '.3.1.2..', 'b3b1b2b.', '.b.b.b..', 'o.o.o.o.', 'oooooooo', '........', '........'],
  ['........', '.2.2.1..', 'b2b2b1b.', '.b.b.b..', 'o.o.o.o.', 'oooooooo', '........', '........'],
];

export const RUINS: readonly Sprite[] = [
  ['..s.....', '..sz...s', '.zsz..zs', '.zsz..zs', '.zszg.zs', '.zsz..zs', 'gsszsgss', 'SSSSSSSS'],
  ['.zssssz.', 'zs....sz', 's......s', 'zg....sz', '.......s', 'z......z', 'gz.g.gzs', 'SSSSSSSS'],
];

export const PERSON: Sprite = ['.j.', '.q.', 'lll', '.l.', '.k.'];
export const CHILD: Sprite = ['.j.', '.q.', '.l.', '.k.'];

export const ANIMALS: Record<string, Sprite> = {
  sheep: ['.AAAA', 'BAAAA', 'BAAAA', '.B..B'],
  goat: ['B....', 'BAAA.', '.AAAA', '.B..B'],
  cat: ['A..A', 'AAAA', '.AAB'],
  dog: ['A....', 'AAAAA', '.AAAA', '.A..A'],
  fox: ['A....', 'AAAAB', '.A.A.'],
  deer: ['B.B..', '.A...', '.AAAA', '.AAAA', '.A..A'],
  rabbit: ['A.A', 'AAA', 'AAB'],
  gull: ['A...A', '.A.A.', '..B..'],
  crab: ['A...A', '.AAA.', 'A.A.A'],
};
