'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Keeps ScrollTrigger in step with Lenis and jumps to the top on navigation. */
function Sync() {
  const pathname = usePathname();
  const lenis = useLenis(() => ScrollTrigger.update());
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);
  return null;
}

/**
 * Lenis smooth scrolling driven by GSAP's ticker, so scroll-scrubbed timelines and the
 * smooth scroll share one clock. Turned off entirely for reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 }}>
      <Sync />
      {children}
    </ReactLenis>
  );
}
