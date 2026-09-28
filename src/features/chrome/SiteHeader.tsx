'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './chrome.module.css';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Story' },
  { href: '/map', label: 'Map' },
  { href: '/logbook', label: 'Logbook' },
  { href: '/chapters', label: 'Chapters' },
];

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function SiteHeader({ day, repo }: { day: number; repo: string }) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on – navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const current = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={styles.header}>
      <div className={`${styles.bar} glass`}>
        <Link href="/" className={styles.brand} aria-label="One Tile a Day – home">
          <Logo className={styles.brandMark} />
          <span>One Tile a Day</span>
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.navLink}
              aria-current={current(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href={`/day/${day}`} className={styles.dayBadge} title="Today's tile">
          <span className="dot" aria-hidden="true" />
          DAY {String(day).padStart(3, '0')}
        </Link>
        <ThemeToggle />
        <a
          className={`${styles.iconLink} ${styles.github}`}
          href={`https://github.com/${repo}`}
          aria-label="Source on GitHub"
        >
          <GitHubIcon />
        </a>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d={open ? 'M3 3l12 12M15 3L3 15' : 'M2 5h14M2 9h14M2 13h14'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <nav
          id="mobile-nav"
          className={`${styles.mobileNav} glass glass-strong`}
          hidden={!open}
          aria-label="Main (mobile)"
        >
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <a href={`https://github.com/${repo}`}>GitHub ↗</a>
        </nav>
      </div>
    </header>
  );
}
