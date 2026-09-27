import Link from 'next/link';
import { ViewTransition } from 'react';
import { CATALOGUE, formatDate, type DayEntry } from '@/features/world';
import { Reveal } from '@/shared/motion';
import styles from './LogbookPreview.module.css';
import { SceneSection } from './SceneSection';
import { SectionHead } from './SectionHead';

export function LogbookPreview({ entries }: { entries: DayEntry[] }) {
  return (
    <SceneSection className="section" camera="overview" dim={0.3} labelledBy="log-title">
      <div className="container">
        <SectionHead eyebrow="Logbook" title="A chronicle, one line per day." id="log-title">
          Every change gets a line of lore. Read backwards, the lines become the island&apos;s history.
        </SectionHead>
        <Reveal stagger="li">
          <ul className={styles.entries}>
            {entries.map((e) => (
              <li key={e.day}>
                <Link href={`/day/${e.day}`} className={`${styles.entry} glass`} transitionTypes={['nav-forward']}>
                  <span className={styles.entryDay}>DAY {String(e.day).padStart(3, '0')}</span>
                  <span className={styles.entryEmoji} aria-hidden="true">
                    {e.action === 'genesis' ? '🌊' : CATALOGUE[e.action].emoji}
                  </span>
                  <span>
                    <ViewTransition name={`day-title-${e.day}`} share="morph" default="none">
                      <span className={styles.entryTitle}>{e.title}</span>
                    </ViewTransition>
                    <br />
                    <span className={styles.entryLore}>
                      {formatDate(e.date)} · {e.lore}
                    </span>
                  </span>
                  <span className={styles.entryArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <Link href="/logbook" className="btn btn-ghost">
            The full logbook <span className="arrow">→</span>
          </Link>
        </p>
      </div>
    </SceneSection>
  );
}
