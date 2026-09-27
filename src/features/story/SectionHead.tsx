import type { ReactNode } from 'react';
import { SplitReveal } from '@/shared/motion';
import styles from './SectionHead.module.css';

/** Eyebrow + split-text title + lede, with a soft scrim so it stays readable over the 3D scene. */
export function SectionHead({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: ReactNode;
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
