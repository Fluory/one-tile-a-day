import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { renderIsleSvg } from '@/features/render';
import { SceneDirective } from '@/features/scene';
import { CATALOGUE, formatDate, worldAt, worldStats } from '@/features/world';
import { getDay, getWorld, repoUrl } from '@/features/world-data';
import pageStyles from '../../page.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorld().days.map((d) => ({ n: String(d.day) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const entry = getDay(Number(n));
  if (!entry) return {};
  return {
    title: `Day ${entry.day}: ${entry.title}`,
    description: entry.lore,
    alternates: { canonical: `/day/${entry.day}` },
  };
}

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const entry = getDay(Number(n));
  if (!entry) notFound();
  const world = getWorld();
  const then = worldAt(world, entry.day);
  const stats = worldStats(then);
  const svg = renderIsleSvg(then, { caption: false });
  const index = world.days.findIndex((d) => d.day === entry.day);
  const prev = world.days[index - 1];
  const next = world.days[index + 1];
  const label = entry.action === 'genesis' ? 'Genesis' : CATALOGUE[entry.action].label;
  const emoji = entry.action === 'genesis' ? '🌊' : CATALOGUE[entry.action].emoji;

  return (
    <div className={`container ${pageStyles.page}`}>
      <SceneDirective camera="focus" focus={{ x: entry.x, y: entry.y }} day={entry.day} dim={0.45} orbit={false} />
      <div className={pageStyles.dayHero}>
        <header className={pageStyles.head}>
          <p className="eyebrow">
            Day {entry.day} · {formatDate(entry.date)} · {label}
          </p>
          <ViewTransition name={`day-title-${entry.day}`} share="morph" default="none">
            <h1 className="h2">
              <span aria-hidden="true">{emoji}</span> {entry.title}
            </h1>
          </ViewTransition>
          <p className="lede">{entry.lore}</p>
          <div className={pageStyles.stats}>
            <span className="pill">{stats.land} tiles of land</span>
            <span className="pill">{stats.inhabitants} inhabitants</span>
            <span className="pill">
              tile {entry.x}, {entry.y}
            </span>
            <span className="pill">
              {entry.source === 'director'
                ? 'chosen by the director'
                : entry.source === 'claude'
                  ? 'chosen by Claude'
                  : 'genesis'}
            </span>
          </div>
          <p>
            <a className="btn btn-ghost" href={repoUrl(`commits/main/world/world.json`)}>
              See the commits <span className="arrow">→</span>
            </a>
          </p>
        </header>
        <div className={`${pageStyles.dayImage} glass`} dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <nav className={pageStyles.dayNav} aria-label="Neighbouring days">
        {prev ? (
          <Link className="btn btn-ghost" href={`/day/${prev.day}`} transitionTypes={['nav-back']}>
            ← Day {prev.day}
          </Link>
        ) : (
          <span />
        )}
        <Link className="btn btn-ghost" href="/logbook">
          Logbook
        </Link>
        {next ? (
          <Link className="btn btn-ghost" href={`/day/${next.day}`} transitionTypes={['nav-forward']}>
            Day {next.day} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
