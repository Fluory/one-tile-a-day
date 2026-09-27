'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useScene } from '@/features/scene';
import styles from './chrome.module.css';

const KEY = 'isle-theme';

function apply(night: boolean) {
  document.documentElement.dataset.theme = night ? 'night' : 'day';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const isNight = () => document.documentElement.dataset.theme === 'night';

/** Day or night on the island. Night switches on the lighthouse. */
export function ThemeToggle() {
  const night = useSyncExternalStore(subscribe, isNight, () => false);

  // The 3D scene follows the theme (night switches on the lighthouse).
  useEffect(() => {
    useScene.getState().set({ night });
  }, [night]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(KEY);
      } catch {
        stored = null;
      }
      if (stored) return;
      apply(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = !night;
    apply(next);
    try {
      localStorage.setItem(KEY, next ? 'night' : 'day');
    } catch {
      /* storage may be blocked – the toggle still works for this visit */
    }
  };

  return (
    <button
      type="button"
      className={styles.theme}
      onClick={toggle}
      aria-pressed={night}
      aria-label={night ? 'Switch to day' : 'Switch to night'}
      title={night ? 'Day' : 'Night – the lighthouse turns on'}
    >
      <span className={styles.themeTrack} data-night={night || undefined}>
        <span className={styles.themeKnob} />
      </span>
    </button>
  );
}
