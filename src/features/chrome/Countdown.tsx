'use client';

import { useEffect, useState } from 'react';

const RUN_HOUR = 8;
const RUN_MINUTE = 47;

function berlinWallClock(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
}

/** Milliseconds until the next routine run at 08:47 in Heilbronn. */
export function untilNextRun(now = new Date()): number {
  const wall = berlinWallClock(now);
  const day = new Date(wall);
  let next = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), RUN_HOUR, RUN_MINUTE, 0);
  if (next <= wall) next += 86_400_000;
  return next - wall;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Live countdown to tomorrow's tile. Renders a placeholder on the server (no hydration mismatch). */
export function Countdown({ className }: { className?: string }) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(untilNextRun());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  const total = ms === null ? null : Math.floor(ms / 1000);
  const text =
    total === null
      ? '--:--:--'
      : `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return (
    <time className={className} aria-live="off" suppressHydrationWarning>
      {text}
    </time>
  );
}
