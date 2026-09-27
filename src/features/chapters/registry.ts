import type { IconName } from '@/features/render';

/**
 * The chapters – short case studies of how the island works. Content lives in
 * src/content/chapters/<slug>.mdx; this list gives them order, cover and summary.
 */
export interface Chapter {
  slug: string;
  no: string;
  title: string;
  summary: string;
  icon: IconName;
  cover: string;
  minutes: number;
}

export const CHAPTERS: readonly Chapter[] = [
  {
    slug: 'why-one-tile',
    no: '01',
    title: 'Why one tile a day?',
    summary: 'A world that is only allowed to change once a day – and why that makes it worth watching.',
    icon: 'tree',
    cover: '#7fd0d4',
    minutes: 3,
  },
  {
    slug: 'world-rules',
    no: '02',
    title: 'How the island decides',
    summary: 'Twenty rules, a director with a sense of drama, and why a library has to wait for three houses.',
    icon: 'library',
    cover: '#c7b6f2',
    minutes: 5,
  },
  {
    slug: 'the-routine',
    no: '03',
    title: 'A day in the life of the routine',
    summary: 'What happens between 08:47 and the merge: idempotency, one pull request and exactly one commit.',
    icon: 'lighthouse',
    cover: '#ffd96a',
    minutes: 5,
  },
  {
    slug: 'pixels-and-seasons',
    no: '04',
    title: 'Pixels, palettes and seasons',
    summary: 'Hand-drawn sprites, soft coastlines from hard tiles, dithered seas – and the same island in 3D.',
    icon: 'windmill',
    cover: '#ff9f8a',
    minutes: 4,
  },
];

export function chapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}
