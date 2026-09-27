'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
  /** Selector of children to stagger; the wrapper itself animates when omitted. */
  stagger?: string;
  y?: number;
}

/** Fade-and-rise when the block scrolls into view. */
export function Reveal({ children, className, stagger, y = 28 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const targets = stagger ? el.querySelectorAll(stagger) : el;
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
