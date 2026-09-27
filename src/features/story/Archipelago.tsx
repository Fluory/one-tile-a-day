import { SITE } from '@/features/world-data';
import { Reveal } from '@/shared/motion';
import { SceneSection } from './SceneSection';
import styles from './story.module.css';

/**
 * Fetch a sibling island's README image at build time (refreshed every few hours) and
 * inline it – visitors never load anything from third-party hosts.
 */
async function siblingImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 21_600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const svg = await res.text();
    if (!svg.trimStart().startsWith('<svg') || svg.length > 2_000_000) return null;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } catch {
    return null;
  }
}

export async function Archipelago() {
  const images = await Promise.all(SITE.siblings.map((s) => siblingImage(s.image)));
  return (
    <SceneSection className="section" camera="far" dim={0.15} labelledBy="islands-title">
      <div className="container">
        <div className={styles.head}>
          <p className="eyebrow">Archipelago</p>
          <h2 id="islands-title" className={styles.headTitle}>
            One island is a mechanic. Three are an archipelago.
          </h2>
          <p className="lede">
            This island grows by its own rules. Two sister islands grow by other forces – the real weather in Heilbronn
            and the wishes of strangers. Same routine, same one commit a day.
          </p>
        </div>
        <Reveal className={styles.islands} stagger="a">
          {SITE.siblings.map((s, i) => (
            <a key={s.repo} href={s.site ?? `https://github.com/${s.repo}`} className={`${styles.island} glass`}>
              <span className={styles.islandThumb}>
                {images[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- inlined data URI, nothing to optimise
                  <img src={images[i] ?? ''} alt={`Today on ${s.name}`} />
                ) : (
                  <span className="pixel muted">{s.name}</span>
                )}
              </span>
              <span>
                <span className={styles.islandName}>{s.name}</span>
                <br />
                <span className="muted">{s.tagline}</span>
                <br />
                <span className="link" style={{ fontWeight: 650 }}>
                  Visit {s.site ? 'the island' : 'the repository'} →
                </span>
              </span>
            </a>
          ))}
        </Reveal>
      </div>
    </SceneSection>
  );
}
