import type { ReactNode } from 'react';
import { PALETTES, renderIsleSvg, type IconName } from '@/features/render';
import { CATALOGUE, ACTIONS, worldAt } from '@/features/world';
import { getWorld } from '@/features/world-data';
import { PixelIcon } from '@/shared/ui';
import styles from './mdx.module.css';

export function Callout({ icon = '💡', children }: { icon?: string; children: ReactNode }) {
  return (
    <aside className={`${styles.callout} glass`}>
      <span className={styles.calloutIcon} aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </aside>
  );
}

/** Today's island (or any past day) as the pixel map from the README. */
export function IslandFigure({ day, caption }: { day?: number; caption?: string }) {
  const world = getWorld();
  const shown = day === undefined ? world : worldAt(world, day);
  const svg = renderIsleSvg(shown, { caption: true });
  const last = shown.days[shown.days.length - 1];
  return (
    <figure className={styles.figure}>
      <div className={`${styles.figureFrame} glass`} dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption>{caption ?? `The island on day ${last?.day ?? 0} – straight from world/world.json.`}</figcaption>
    </figure>
  );
}

/** Every rule of the world, generated from the catalogue the code enforces. */
export function RuleTable() {
  return (
    <div className={`${styles.tableWrap} glass`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Change</th>
            <th scope="col">Rule</th>
          </tr>
        </thead>
        <tbody>
          {ACTIONS.map((a) => (
            <tr key={a}>
              <td>
                <span aria-hidden="true">{CATALOGUE[a].emoji}</span> <strong>{CATALOGUE[a].label}</strong>
              </td>
              <td>{CATALOGUE[a].rule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SWATCH_KEYS = ['sea0', 'sea2', 'sand1', 'grass1', 'forest1', 'leaf1', 'roof1', 'accent'] as const;

export function Swatches() {
  return (
    <div className={styles.swatches}>
      {(Object.keys(PALETTES) as (keyof typeof PALETTES)[]).map((season) => (
        <div key={season} className={`${styles.season} glass`}>
          <p>{season.toUpperCase()}</p>
          <div className={styles.chips}>
            {SWATCH_KEYS.map((k) => (
              <span
                key={k}
                className={styles.chip}
                style={{ background: PALETTES[season][k] }}
                title={`${k} ${PALETTES[season][k]}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sprites({ names }: { names: IconName[] }) {
  return (
    <div className={`${styles.sprites} glass`}>
      {names.map((n) => (
        <div key={n} className={styles.sprite}>
          <PixelIcon name={n} size={72} label={n} />
          {n.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
