'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScene } from '@/features/scene';
import { formatDate, type World } from '@/features/world';
import styles from './story.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface DayLite {
  day: number;
  date: string;
  title: string;
  lore: string;
}

const MIN_REAL_DAYS = 30;

/**
 * The centre piece: scroll to replay the island day by day. While the real island is
 * younger than a month, the section shows a clearly labelled simulated year grown by the
 * same rules – and one click switches to the real history.
 */
export function Timelapse({ real }: { real: DayLite[] }) {
  const realLast = real[real.length - 1]?.day ?? 0;
  const [source, setSource] = useState<'real' | 'simulation'>(realLast < MIN_REAL_DAYS ? 'simulation' : 'real');
  const [simDays, setSimDays] = useState<DayLite[] | null>(null);
  const [day, setDay] = useState(0);
  const root = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const active = useRef(false);

  const days = useMemo(() => (source === 'simulation' ? (simDays ?? []) : real), [source, simDays, real]);
  const last = days[days.length - 1]?.day ?? 0;

  useEffect(() => {
    if (source !== 'simulation' || simDays) return;
    let cancelled = false;
    fetch('/data/simulation.json')
      .then((r) => r.json() as Promise<World>)
      .then((w) => {
        if (cancelled) return;
        useScene.getState().set({ simulation: w });
        setSimDays(w.days.map(({ day: d, date, title, lore }) => ({ day: d, date, title, lore })));
      })
      .catch(() => setSource('real'));
    return () => {
      cancelled = true;
    };
  }, [source, simDays]);

  const entry = useMemo(() => {
    let found = days[0];
    for (const d of days) {
      if (d.day <= day) found = d;
      else break;
    }
    return found;
  }, [days, day]);

  const direct = useCallback(
    (progress: number) => {
      const d = Math.round(progress * last);
      setDay(d);
      if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
      useScene.getState().set({
        day: d,
        source,
        camera: 'overview',
        dim: 0,
        shift: 0,
        shiftY: window.innerWidth > 900 ? 0 : -0.12,
        orbit: true,
        focus: null,
      });
    },
    [last, source],
  );

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onToggle: (self) => {
          active.current = self.isActive;
          if (self.isActive) direct(self.progress);
          else useScene.getState().set({ day: Infinity, source: 'real' });
        },
        onUpdate: (self) => {
          if (active.current) direct(self.progress);
        },
      });
    },
    { scope: root, dependencies: [direct] },
  );

  return (
    <section ref={root} className={styles.lapse} aria-labelledby="lapse-title">
      <div className={styles.lapseSticky}>
        <div className={`container ${styles.lapseInner}`}>
          <div className={`${styles.lapseCard} glass`}>
            <h2 id="lapse-title" className="eyebrow">
              {source === 'simulation' ? 'Timelapse · simulated first year' : 'Timelapse · the real island'}
            </h2>
            <p className={styles.counter} aria-live="polite" aria-atomic="true">
              <span className={styles.counterLabel}>Day</span>
              {String(day).padStart(3, '0')}
            </p>
            {entry && <p className={styles.counterDate}>{formatDate(entry.date)}</p>}
            <div className={styles.lapseTrack} aria-hidden="true">
              <div ref={fill} className={styles.lapseFill} style={{ transform: 'scaleX(0)' }} />
            </div>
            <div className={styles.simNote}>
              {source === 'simulation' ? (
                <>
                  <span className={styles.simBadge}>SIMULATION</span>
                  <span>
                    The real island is {realLast} {realLast === 1 ? 'day' : 'days'} old. This year was grown by the same
                    rules.
                  </span>
                  <button type="button" className={styles.switch} onClick={() => setSource('real')}>
                    Show the real island
                  </button>
                </>
              ) : (
                <>
                  <span>Scroll to replay every day since the sandbank.</span>
                  <button type="button" className={styles.switch} onClick={() => setSource('simulation')}>
                    Show a simulated year
                  </button>
                </>
              )}
            </div>
          </div>
          <div className={`${styles.caption} glass`}>
            {entry ? (
              <>
                <p className="eyebrow">Day {entry.day}</p>
                <p className={styles.captionTitle}>{entry.title}</p>
                <p className="muted">{entry.lore}</p>
              </>
            ) : (
              <p className="muted">Loading the island…</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
