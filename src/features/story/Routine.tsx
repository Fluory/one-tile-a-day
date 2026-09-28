import type { DayEntry } from '@/features/world';
import { Reveal } from '@/shared/motion';
import styles from './Routine.module.css';
import { SceneSection } from './SceneSection';
import { SectionHead } from './SectionHead';

const STEPS = [
  ['08:47', 'The routine wakes up', 'A Claude routine starts in the cloud, every day at 08:47 in Heilbronn.'],
  ['01', 'Is today already done?', 'If there is a commit for today it stops. Running twice changes nothing.'],
  ['02', 'Read the island', 'npm run day -- plan lists every legal change, the recent lore and a suggestion.'],
  ['03', 'Choose and write', 'Claude picks the change that tells the best story and writes one line of lore.'],
  ['04', 'The rules decide', 'The code checks the choice. An illegal tile is simply impossible.'],
  ['05', 'Exactly one commit', 'A pull request with one commit – once CI is green it is merged into main.'],
  ['06', 'The site grows too', 'The merge redeploys this website. The island you see is the commit of today.'],
] as const;

export function Routine({ latest, routineUrl }: { latest: DayEntry; routineUrl: string }) {
  return (
    <SceneSection className="section" camera="far" dim={0.35} labelledBy="routine-title">
      <div className="container">
        <SectionHead eyebrow="How it grows" title="Grown by a routine, one commit at a time." id="routine-title">
          No human places the tiles. A scheduled Claude routine does – inside a strict frame of code, tests and
          continuous integration. Everything it does is public.
        </SectionHead>
        <div className={styles.routine}>
          <Reveal>
            <ol className={styles.steps}>
              {STEPS.map(([no, title, text]) => (
                <li key={no} className={`${styles.step} glass`}>
                  <span className={styles.stepNo}>{no}</span>
                  <div>
                    <p className={styles.stepTitle}>{title}</p>
                    <p className={styles.stepText}>{text}</p>
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
