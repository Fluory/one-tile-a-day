import Link from 'next/link';
import { ViewTransition } from 'react';
import type { IconName } from '@/features/render';
import { CATALOGUE, formatDate, type Action, type DayEntry } from '@/features/world';
import { Reveal, SplitReveal } from '@/shared/motion';
import { PixelIcon } from '@/shared/ui';
import { SceneSection } from './SceneSection';
import styles from './story.module.css';

function Head({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.head}>
      <p className="eyebrow">{eyebrow}</p>
      <SplitReveal as="h2" id={id} className={styles.headTitle} by="words">
        {title}
      </SplitReveal>
      {children && <p className="lede">{children}</p>}
    </div>
  );
}

const RULE_CARDS: [Action, IconName][] = [
  ['house', 'house'],
  ['harbor', 'harbor'],
  ['library', 'library'],
  ['lighthouse', 'lighthouse'],
  ['windmill', 'windmill'],
  ['ruin', 'ruin'],
];

export function Rules({ rulesUrl }: { rulesUrl: string }) {
  return (
    <SceneSection className="section" camera="top" dim={0.25} labelledBy="rules-title">
      <div className="container">
        <Head eyebrow="World rules" title="Nothing is random. Everything waits for something." id="rules-title">
          A house needs land around it, a harbour needs a coast, a library waits for three houses. The routine can only
          choose among what the rules allow – so the island grows like a place, not like noise.
        </Head>
        <Reveal className={styles.rules} stagger="article">
          {RULE_CARDS.map(([action, icon]) => (
            <article key={action} className={`${styles.rule} glass`}>
              <div className={styles.ruleIcon}>
                <PixelIcon name={icon} size={46} />
              </div>
              <h3 className={styles.ruleName}>{CATALOGUE[action].label}</h3>
              <p className={styles.ruleText}>{CATALOGUE[action].rule}</p>
            </article>
          ))}
        </Reveal>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <a className="btn btn-ghost" href={rulesUrl}>
            All world rules <span className="arrow">→</span>
          </a>
        </p>
      </div>
    </SceneSection>
  );
}

const STEPS = [
  ['08:47', 'The routine wakes up', 'A Claude routine starts in the cloud, every day at 08:47 in Heilbronn.'],
  ['01', 'Is today already done?', 'If there is a commit for today it stops. Running twice changes nothing.'],
  ['02', 'Read the island', '`npm run day -- plan` lists every legal change, the recent lore and a suggestion.'],
  ['03', 'Choose and write', 'Claude picks the change that tells the best story and writes one line of lore.'],
  ['04', 'The rules decide', 'The code checks the choice. An illegal tile is simply impossible.'],
  ['05', 'Exactly one commit', 'A pull request with one commit – once CI is green it is merged into main.'],
  ['06', 'The site grows too', 'The merge redeploys this website. The island you see is the commit of today.'],
] as const;

export function Routine({ latest, routineUrl }: { latest: DayEntry; routineUrl: string }) {
  return (
    <SceneSection className="section" camera="far" dim={0.35} labelledBy="routine-title">
      <div className="container">
        <Head eyebrow="How it grows" title="Grown by a routine, one commit at a time." id="routine-title">
          No human places the tiles. A scheduled Claude routine does – inside a strict frame of code, tests and
          continuous integration. Everything it does is public.
        </Head>
        <div className={styles.routine}>
          <Reveal>
            <ol className={styles.steps}>
              {STEPS.map(([no, title, text]) => (
                <li key={no} className={`${styles.step} glass`}>
                  <span className={styles.stepNo}>{no}</span>
                  <div>
                    <p className={styles.stepTitle}>{title}</p>
                    <p className={styles.stepText}>{text.replace(/`/g, '')}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <div className={`${styles.commit} glass`}>
            <p className="eyebrow">Today&apos;s commit</p>
            <pre className={styles.terminal}>
              <span className={styles.prompt}>$</span> npm run day -- status{'\n'}
              <span className={styles.dim}>{`{ "day": ${latest.day}, "done": true }`}</span>
              {'\n\n'}
              <span className={styles.prompt}>$</span> git log -1 --format=%s{'\n'}
              <span className={styles.ok}>{`Day ${latest.day}: ${latest.title}`}</span>
              {'\n\n'}
              <span className={styles.dim}># one tile · one lore line · one commit</span>
            </pre>
            <p className="muted">
              The routine&apos;s instructions are a file in the repository – versioned, reviewable, open.
            </p>
            <p>
              <a className="btn btn-ghost" href={routineUrl}>
                Read ROUTINE.md <span className="arrow">→</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </SceneSection>
  );
}

export function MapTeaser({ svg }: { svg: string }) {
  return (
    <SceneSection className="section" camera="top" dim={0.2} labelledBy="map-title">
      <div className={`container ${styles.mapTeaser}`}>
        <Head eyebrow="Map & timeline" title="The whole island, tile by tile." id="map-title">
          Zoom in, drag the timeline back to the sandbank, hover any tile to read its story. The same pixels live in the
          README of the repository and change with every commit.
        </Head>
        <Reveal>
          <Link href="/map" className={`${styles.mapFrame} glass`} aria-label="Open the interactive map">
            <ViewTransition name="island-map" share="morph" default="none">
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </ViewTransition>
          </Link>
        </Reveal>
      </div>
    </SceneSection>
  );
}

export function LogbookPreview({ entries }: { entries: DayEntry[] }) {
  return (
    <SceneSection className="section" camera="overview" dim={0.3} labelledBy="log-title">
      <div className="container">
        <Head eyebrow="Logbook" title="A chronicle, one line per day." id="log-title">
          Every change gets a line of lore. Read backwards, the lines become the island&apos;s history.
        </Head>
        <Reveal stagger="li">
          <ul className={styles.entries}>
            {entries.map((e) => (
              <li key={e.day}>
                <Link href={`/day/${e.day}`} className={`${styles.entry} glass`} transitionTypes={['nav-forward']}>
                  <span className={styles.entryDay}>DAY {String(e.day).padStart(3, '0')}</span>
                  <span className={styles.entryEmoji} aria-hidden="true">
                    {e.action === 'genesis' ? '🌊' : CATALOGUE[e.action].emoji}
                  </span>
                  <span>
                    <ViewTransition name={`day-title-${e.day}`} share="morph" default="none">
                      <span className={styles.entryTitle}>{e.title}</span>
                    </ViewTransition>
                    <br />
                    <span className={styles.entryLore}>
                      {formatDate(e.date)} · {e.lore}
                    </span>
                  </span>
                  <span className={styles.entryArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <Link href="/logbook" className="btn btn-ghost">
            The full logbook <span className="arrow">→</span>
          </Link>
        </p>
      </div>
    </SceneSection>
  );
}
