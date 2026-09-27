import type { CSSProperties } from 'react';
import { createRng } from '@/features/world';
import styles from './Grass.module.css';

const GREENS = [
  ['#3f7a31', '#8cc657'],
  ['#4f8f3a', '#a3d466'],
  ['#2f6b35', '#76b84f'],
  ['#5a9a3f', '#b7dd74'],
];
const FLOWERS = ['#ff6b57', '#ffd96a', '#b46ad8', '#fbfaf5'];

/**
 * A strip of swaying grass drawn purely with CSS (clip-path blades + keyframes).
 * Deterministic, so server and client render the same meadow.
 */
export function Grass({ blades = 180, height = 96, seed = 7 }: { blades?: number; height?: number; seed?: number }) {
  const rng = createRng(seed);
  const items = Array.from({ length: blades }, (_, i) => {
    const [c0, c1] = GREENS[Math.floor(rng() * GREENS.length)] ?? ['#4f8f3a', '#a3d466'];
    return {
      key: i,
      style: {
        '--x': `${(i / blades) * 100 + rng() * 0.8}%`,
        '--w': `${5 + rng() * 7}px`,
        '--h': `${35 + rng() * 60}%`,
        '--r': `${rng() * 14 - 7}deg`,
        '--d': `${2.4 + rng() * 2.2}s`,
        '--delay': `${-rng() * 4}s`,
        '--c0': c0,
        '--c1': c1,
      } as CSSProperties,
    };
  });
  const flowers = Array.from({ length: Math.round(blades / 14) }, (_, i) => ({
    key: i,
    style: {
      '--x': `${rng() * 100}%`,
      '--h': `${40 + rng() * 45}%`,
      '--d': `${2.6 + rng() * 2}s`,
      '--delay': `${-rng() * 4}s`,
      '--c': FLOWERS[Math.floor(rng() * FLOWERS.length)],
    } as CSSProperties,
  }));
  return (
    <div className={styles.meadow} style={{ '--grass-height': `${height}px` } as CSSProperties} aria-hidden="true">
      {items.map((b) => (
        <span key={b.key} className={styles.blade} style={b.style} />
      ))}
      {flowers.map((f) => (
        <span key={`f${f.key}`} className={styles.flower} style={f.style} />
      ))}
    </div>
  );
}
