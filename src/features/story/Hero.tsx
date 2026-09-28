import Link from 'next/link';
import { Countdown } from '@/features/chrome';
import { formatDate, type DayEntry, type WorldStats } from '@/features/world';
import { Magnetic, SplitReveal } from '@/shared/motion';
import { SceneSection } from './SceneSection';
import styles from './Hero.module.css';

export function Hero({ latest, stats }: { latest: DayEntry; stats: WorldStats }) {
  return (
    <SceneSection className={styles.hero} camera="hero" shift={0.14} mobileShiftY={0.24} labelledBy="hero-title">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">
            Day {latest.day} · {formatDate(latest.date)} · {stats.season}
          </p>
          <SplitReveal as="h1" id="hero-title" className={styles.heroTitle} by="chars" immediate>
            One tile <em>a&nbsp;day.</em>
          </SplitReveal>
          <SplitReveal as="p" className="lede" by="lines" immediate delay={0.5}>
            A pixel island in a public GitHub repository. Every morning at 08:47 a Claude routine adds exactly one tile,
            writes one line of lore and makes exactly one commit.
          </SplitReveal>
          <div className={styles.heroActions}>
            <Magnetic>
              <Link href="/map" className="btn btn-accent">
                Explore the map <span className="arrow">→</span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/logbook" className="btn btn-ghost">
                Read the logbook
              </Link>
            </Magnetic>
          </div>
        </div>
        <aside className={`${styles.today} glass`} aria-label="Today on the island">
          <div className={styles.todayHead}>
            <span className="eyebrow">Today · Day {latest.day}</span>
            <span className="pill">
              <span className="dot" aria-hidden="true" /> live
            </span>
          </div>
          <p className={styles.todayTitle}>{latest.title}</p>
          <p className={styles.todayLore}>{latest.lore}</p>
          <div className={styles.todayMeta}>
            <span>
              {stats.land} tiles · {stats.inhabitants} people
            </span>
            <span>
              next tile in <Countdown />
            </span>
          </div>
        </aside>
      </div>
      <div className={styles.scrollCue} aria-hidden="true">
        SCROLL
        <span />
      </div>
    </SceneSection>
  );
}
