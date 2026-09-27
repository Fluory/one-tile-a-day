import Link from 'next/link';
import { Grass } from '@/shared/ui';
import styles from './chrome.module.css';
import { Countdown } from './Countdown';

interface Props {
  day: number;
  repo: string;
  siblings: readonly { name: string; repo: string; site?: string }[];
}

export function SiteFooter({ day, repo, siblings }: Props) {
  const gh = (path = '') => `https://github.com/${repo}${path}`;
  return (
    <footer className={styles.footer}>
      <Grass />
      <div className={styles.footerBody}>
        <div className={`container ${styles.footerGrid}`}>
          <div className={styles.footerIntro}>
            <p className={styles.footerTitle}>
              Day {day}.<br />
              Tomorrow, one more tile.
            </p>
            <p className={styles.footerLead}>
              Next routine run in <Countdown className="mono" /> – every day at 08:47 in Heilbronn.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h2>The island</h2>
            <ul>
              <li>
                <Link href="/">Story</Link>
              </li>
              <li>
                <Link href="/map">Map &amp; timeline</Link>
              </li>
              <li>
                <Link href="/logbook">Logbook</Link>
              </li>
              <li>
                <Link href="/chapters">Chapters</Link>
              </li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h2>Open source</h2>
            <ul>
              <li>
                <a href={gh()}>Repository</a>
              </li>
              <li>
                <a href={gh('/blob/main/ROUTINE.md')}>The daily routine</a>
              </li>
              <li>
                <a href={gh('/blob/main/RULES.md')}>World rules</a>
              </li>
              <li>
                <a href={gh('/blob/main/world/world.json')}>world.json</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h2>Archipelago</h2>
            <ul>
              {siblings.map((s) => (
                <li key={s.repo}>
                  <a href={s.site ?? `https://github.com/${s.repo}`}>{s.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`container ${styles.footerBottom}`}>
          <span className={styles.aiBadge}>AI-MAINTAINED · ONE COMMIT A DAY</span>
          <span>
            Code MIT · island CC BY 4.0 · <Link href="/impressum">Impressum</Link> ·{' '}
            <Link href="/datenschutz">Datenschutz</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
