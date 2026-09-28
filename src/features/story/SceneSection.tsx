'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';
import { useScene, type CameraPreset } from '@/features/scene';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
  camera: CameraPreset;
  dim?: number;
  shift?: number;
  /** Vertical picture shift used on narrow screens instead of the horizontal one. */
  mobileShiftY?: number;
  orbit?: boolean;
  focus?: { x: number; y: number } | null;
  labelledBy?: string;
}

/**
 * A story section that directs the 3D scene while it is on screen: when it reaches the
 * middle of the viewport, the camera moves to its shot. Scrolling back restores it.
 */
export function SceneSection({
  children,
  className,
  id,
  camera,
  dim = 0,
  shift = 0,
  mobileShiftY = 0,
  orbit = true,
  focus = null,
  labelledBy,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const apply = () => {
        const wide = window.innerWidth > 900;
        useScene.getState().set({
          camera,
          dim,
          shift: wide ? shift : 0,
          shiftY: wide ? 0 : mobileShiftY,
          orbit,
          focus,
          day: Infinity,
          source: 'real',
        });
      };
      ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 45%', onEnter: apply, onEnterBack: apply });
    },
    { scope: ref, dependencies: [camera, dim, shift, mobileShiftY, orbit, focus?.x, focus?.y] },
  );
  return (
    <section ref={ref} id={id} className={className} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}
