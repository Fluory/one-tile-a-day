'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false });

let webgl: boolean | undefined;
function hasWebGL(): boolean {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement('canvas');
      webgl = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const noSubscription = () => () => undefined;

/**
 * The one persistent canvas. It lives in the root layout, so the island keeps living (and
 * transforming) while you move between pages. Without WebGL the sky gradient stays alone.
 */
export function SceneRoot() {
  const supported = useSyncExternalStore(noSubscription, hasWebGL, () => false);
  return supported ? <SceneCanvas /> : null;
}
