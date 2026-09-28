import type { Metadata } from 'next';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { SceneDirective } from '@/features/scene';
import { CATALOGUE, formatDate, formatMonth, type DayEntry } from '@/features/world';
import { getDaysNewestFirst, getStats, repoUrl } from '@/features/world-data';
import pageStyles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Logbook',
  description: 'The chronicle of the island – one line of lore for every day since the sandbank.',
  alternates: { canonical: '/logbook' },
};

export default function LogbookPage() {
  const stats = getStats();
  const months = new Map<string, DayEntry[]>();
  for (const entry of getDaysNewestFirst()) {
    const key = formatMonth(entry.date);
    months.set(key, [...(months.get(key) ?? []), entry]);
  }
  return (
    <div className={`${pageStyles.narrow} ${pageStyles.page}`}>
      <SceneDirective camera="far" dim={0.6} />
      <header className={pageStyles.head}>
        <p className="eyebrow">Logbook</p>
        <h1 className="h2">One line a day.</h1>
        <p className="lede">
          The island&apos;s chronicle, newest day first. It is generated from{' '}
          <a className="link" href={repoUrl('blob/main/world/world.json')}>
            world.json
          </a>{' '}
          and lives in the repository as{' '}
          <a className="link" href={repoUrl('blob/main/LOGBOOK.md')}>
            LOGBOOK.md
          </a>
          .
        </p>
        <div className={pageStyles.stats}>
          <span className="pill">Day {stats.day}</span>
          <span className="pill">{stats.land} tiles of land</span>
          <span className="pill">{stats.houses} houses</span>
          <span className="pill">{stats.inhabitants} inhabitants</span>
          <span className="pill">{stats.animals} animals</span>
        </div>
      </header>
      <div className={`${pageStyles.panel} glass ${pageStyles.months}`}>
        {[...months.entries()].map(([month, entries]) => (
          <section key={month} className={pageStyles.month} aria-label={month}>
            <h2>{month}</h2>
            <ol className={pageStyles.list} reversed>
              {entries.map((e) => (
                <li key={e.day}>
                  <Link href={`/day/${e.day}`} className={pageStyles.item} transitionTypes={['nav-forward']}>
                    <span className={pageStyles.itemDay}>DAY {String(e.day).padStart(3, '0')}</span>
                    <span aria-hidden="true">{e.action === 'genesis' ? '🌊' : CATALOGUE[e.action].emoji}</span>
                    <span>
                      <ViewTransition name={`day-title-${e.day}`} share="morph" default="none">
                        <strong>{e.title}</strong>
                      </ViewTransition>{' '}
                      <span className="muted">
                        – {e.lore} <span style={{ whiteSpace: 'nowrap' }}>({formatDate(e.date)})</span>
                        {e.source === 'director' ? ' · auto' : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
