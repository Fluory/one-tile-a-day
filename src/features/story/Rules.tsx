import type { IconName } from '@/features/render';
import { CATALOGUE, type Action } from '@/features/world';
import { Reveal } from '@/shared/motion';
import { PixelIcon } from '@/shared/ui';
import styles from './Rules.module.css';
import { SceneSection } from './SceneSection';
import { SectionHead } from './SectionHead';

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
        <SectionHead eyebrow="World rules" title="Nothing is random. Everything waits for something." id="rules-title">
          A house needs land around it, a harbour needs a coast, a library waits for three houses. The routine can only
          choose among what the rules allow – so the island grows like a place, not like noise.
        </SectionHead>
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
