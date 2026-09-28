'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

interface Props {
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span';
  children: ReactNode;
  className?: string;
  /** chars for display headlines, words for sentences, lines for paragraphs. */
  by?: 'chars' | 'words' | 'lines';
  /** Animate on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
  delay?: number;
  id?: string;
}

/**
 * Text that assembles itself: GSAP SplitText splits into masked lines, then words or
 * characters rise into place. Screen readers get the plain text (SplitText keeps aria).
 */
export function SplitReveal({
  as = 'div',
  children,
  className,
  by = 'words',
  immediate = false,
  delay = 0,
  id,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(el, { visibility: 'visible' });
        return;
      }
      let split: SplitText | undefined;
      document.fonts.ready.then(() => {
        split = SplitText.create(el, {
          type: by === 'lines' ? 'lines' : `lines,${by}`,
          mask: 'lines',
          aria: 'auto',
          autoSplit: true,
          onSplit(self) {
            const targets = by === 'chars' ? self.chars : by === 'words' ? self.words : self.lines;
            return gsap.from(targets, {
              yPercent: 110,
              rotate: by === 'chars' ? 6 : 2,
              opacity: 0,
              duration: by === 'chars' ? 1.1 : 0.9,
              ease: 'expo.out',
              stagger: by === 'chars' ? 0.028 : by === 'words' ? 0.045 : 0.09,
              delay,
              scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%', once: true },
            });
          },
        });
        gsap.set(el, { visibility: 'visible' });
      });
      return () => split?.revert();
    },
    { scope: ref, dependencies: [by, immediate, delay] },
  );

  // Typed as div for the ref; the actual tag is whatever `as` says.
  const Tag = as as 'div';
  return (
    <Tag ref={ref} className={className} id={id} data-split="">
      {children}
    </Tag>
  );
}
