import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ViewTransition } from 'react';
import styles from '@/features/story/story.module.css';
import { PixelIcon } from '@/shared/ui';
import { Reveal } from '@/shared/motion';
import { CHAPTERS } from './registry';

/** Chapter cards – their cover morphs into the chapter header (View Transitions). */
export function ChapterCards() {
  return (
    <Reveal className={styles.chapters} stagger="a">
      {CHAPTERS.map((c) => (
        <Link
          key={c.slug}
          href={`/chapters/${c.slug}`}
          className={`${styles.chapter} glass`}
          style={{ '--cover': c.cover } as CSSProperties}
          transitionTypes={['nav-forward']}
        >
          <ViewTransition name={`chapter-cover-${c.slug}`} share="morph" default="none">
            <div className={styles.chapterCover}>
              <PixelIcon name={c.icon} size={120} />
            </div>
          </ViewTransition>
          <div className={styles.chapterBody}>
            <span className={styles.chapterNo}>
              CHAPTER {c.no} · {c.minutes} MIN
            </span>
            <ViewTransition name={`chapter-title-${c.slug}`} share="morph" default="none">
              <h3 className={styles.chapterTitle}>{c.title}</h3>
            </ViewTransition>
            <p className="muted">{c.summary}</p>
          </div>
        </Link>
      ))}
    </Reveal>
  );
}
