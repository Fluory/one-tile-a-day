import type { Season } from '@/features/world';

/**
 * One small, fixed palette per season. Everything the island shows – the pixel map, the
 * README image, the 3D scene on the website – takes its colours from here, which keeps the
 * look consistent no matter what grows.
 */
export type ColorKey =
  | 'sea0'
  | 'sea1'
  | 'sea2'
  | 'sea3'
  | 'foam'
  | 'sand0'
  | 'sand1'
  | 'sand2'
  | 'grass0'
  | 'grass1'
  | 'grass2'
  | 'forest0'
  | 'forest1'
  | 'forest2'
  | 'rock0'
  | 'rock1'
  | 'rock2'
  | 'snow'
  | 'trunk'
  | 'trunk0'
  | 'leaf0'
  | 'leaf1'
  | 'leaf2'
  | 'pine0'
  | 'pine1'
  | 'accent'
  | 'roof0'
  | 'roof1'
  | 'wall0'
  | 'wall1'
  | 'door'
  | 'light'
  | 'path0'
  | 'path1'
  | 'soil0'
  | 'soil1'
  | 'crop0'
  | 'crop1'
  | 'wood0'
  | 'wood1'
  | 'stone0'
  | 'stone1'
  | 'white'
  | 'red'
  | 'metal'
  | 'ink'
  | 'skin'
  | 'hair'
  | 'cloth'
  | 'sail'
  | 'awning'
  | 'flower1'
  | 'flower2'
  | 'flower3'
  | 'fur0'
  | 'fur1'
  | 'wool'
  | 'shadow'
  | 'bg'
  | 'text'
  | 'textDim'
  | 'highlight';

export type Palette = Record<ColorKey, string>;

const SUMMER: Palette = {
  sea0: '#1d5a7a',
  sea1: '#2a7f9e',
  sea2: '#3fa6b8',
  sea3: '#7fd0d4',
  foam: '#e8f7f2',
  sand0: '#d9b77e',
  sand1: '#ecd49d',
  sand2: '#f7e7bd',
  grass0: '#4f8f3a',
  grass1: '#6aab45',
  grass2: '#8cc657',
  forest0: '#1f4d2b',
  forest1: '#2f6b35',
  forest2: '#468740',
  rock0: '#5d5a66',
  rock1: '#86818c',
  rock2: '#b3adb3',
  snow: '#f4f7fb',
  trunk: '#7a4f2e',
  trunk0: '#553520',
  leaf0: '#2e6b33',
  leaf1: '#44913e',
  leaf2: '#76b84f',
  pine0: '#1e4f35',
  pine1: '#2f6e45',
  accent: '#d9463b',
  roof0: '#9c3b2e',
  roof1: '#c95a3c',
  wall0: '#d8c6a4',
  wall1: '#f2e6c9',
  door: '#6b4128',
  light: '#ffd96a',
  path0: '#c7a577',
  path1: '#dcc193',
  soil0: '#7a5634',
  soil1: '#94693f',
  crop0: '#c9a93f',
  crop1: '#e6cc5a',
  wood0: '#6d4a2f',
  wood1: '#946842',
  stone0: '#7d7a82',
  stone1: '#a9a4ab',
  white: '#fbfaf5',
  red: '#d3423a',
  metal: '#3b3f4a',
  ink: '#1c2230',
  skin: '#e7b590',
  hair: '#4a3223',
  cloth: '#3f6fb0',
  sail: '#f4efe2',
  awning: '#d3423a',
  flower1: '#e8504a',
  flower2: '#f5d04a',
  flower3: '#b46ad8',
  fur0: '#8a5a36',
  fur1: '#c08552',
  wool: '#f3efe6',
  shadow: '#0b1a2640',
  bg: '#0f2233',
  text: '#f7f1e3',
  textDim: '#9fb6c2',
  highlight: '#ffe066',
};

const SPRING: Palette = {
  ...SUMMER,
  sea1: '#2b84a2',
  sea2: '#46adbd',
  grass0: '#5a9a3f',
  grass1: '#78b84c',
  grass2: '#a3d466',
  leaf0: '#3d7d38',
  leaf1: '#5aa84a',
  leaf2: '#93cf63',
  accent: '#f3a6c0',
  crop0: '#7fb24a',
  crop1: '#a6d25e',
  flower1: '#f07aa0',
  flower2: '#fbe36b',
  flower3: '#9d7ff0',
};

const AUTUMN: Palette = {
  ...SUMMER,
  sea0: '#1b4f6b',
  sea1: '#27708c',
  sea2: '#3b93a4',
  grass0: '#6b7f35',
  grass1: '#8a9a43',
  grass2: '#aeb45a',
  forest1: '#4f5a2a',
  leaf0: '#a4452a',
  leaf1: '#d2703a',
  leaf2: '#eba74a',
  accent: '#e0552f',
  crop0: '#9c7a3a',
  crop1: '#b89452',
  flower1: '#d9642e',
  flower2: '#e0b13a',
  flower3: '#8e4a8a',
};

const WINTER: Palette = {
  ...SUMMER,
  sea0: '#173d56',
  sea1: '#235a77',
  sea2: '#357890',
  sea3: '#8fc2d0',
  foam: '#f4fbff',
  sand0: '#c9bda3',
  sand1: '#ddd3bc',
  sand2: '#ece6d6',
  grass0: '#a9bccc',
  grass1: '#dfe8ef',
  grass2: '#f7fafc',
  forest0: '#1f3f35',
  forest1: '#2f5a4a',
  leaf0: '#5a4535',
  leaf1: '#6e5644',
  leaf2: '#8a7058',
  pine0: '#1d4436',
  pine1: '#2c5f4b',
  accent: '#e4eef5',
  crop0: '#cfd9e2',
  crop1: '#e9eff4',
  soil0: '#8b8279',
  soil1: '#a79e94',
  flower1: '#c9d6e2',
  flower2: '#e3e9ef',
  flower3: '#b9c4d2',
  path0: '#b7ab96',
  path1: '#cfc5b1',
};

export const PALETTES: Record<Season, Palette> = {
  spring: SPRING,
  summer: SUMMER,
  autumn: AUTUMN,
  winter: WINTER,
};

/** Roof colours per house variant: terracotta, slate blue, moss green. */
export const ROOFS: readonly [string, string][] = [
  ['#9c3b2e', '#c95a3c'],
  ['#34506e', '#4c7197'],
  ['#4d6b3a', '#6a8f4c'],
];

export const SAILS: readonly string[] = ['#f4efe2', '#d3423a', '#3f6fb0'];

export const AWNINGS: readonly string[] = ['#d3423a', '#3f6fb0'];

/** Clothes per trade – you can tell who does what at a glance. */
export const CLOTHES: Record<string, string> = {
  fisher: '#2f5e9e',
  farmer: '#9a7a2e',
  keeper: '#233a5e',
  librarian: '#7a4ea0',
  miller: '#e8e2d2',
  baker: '#f2efe6',
  carpenter: '#8a5a33',
  weaver: '#c0453e',
  healer: '#3f8f6a',
  merchant: '#d9822f',
  boatbuilder: '#2f8a8f',
  storyteller: '#9a4f8a',
  child: '#f0c23e',
};

export const FUR: Record<string, [string, string]> = {
  sheep: ['#f3efe6', '#2b2a2e'],
  goat: ['#b9aa94', '#5b4a3a'],
  cat: ['#e08a3c', '#9a5a26'],
  dog: ['#9a6a3e', '#5e3d22'],
  fox: ['#e0662e', '#fbf3e6'],
  deer: ['#a0673a', '#6e4222'],
  rabbit: ['#b8a58f', '#f3efe6'],
  gull: ['#f7f7f2', '#8a939e'],
  crab: ['#d9463b', '#8e2a24'],
};
