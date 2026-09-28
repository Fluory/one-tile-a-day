'use client';

import { useEffect } from 'react';
import { useScene, type CameraPreset, type Focus, type Source } from './store';

interface Props {
  camera?: CameraPreset;
  day?: number;
  focus?: Focus | null;
  dim?: number;
  orbit?: boolean;
  shift?: number;
  shiftY?: number;
  source?: Source;
}

/**
 * Drop this into any page to direct the persistent 3D scene: which day, which camera shot,
 * how prominent. Values not given fall back to the calm default.
 */
export function SceneDirective({
  camera = 'hero',
  day = Infinity,
  focus = null,
  dim = 0,
  orbit = true,
  shift = 0,
  shiftY = 0,
  source = 'real',
}: Props) {
  const focusX = focus?.x;
  const focusY = focus?.y;
  useEffect(() => {
    useScene.getState().set({
      camera,
      day,
      focus: focusX === undefined || focusY === undefined ? null : { x: focusX, y: focusY },
      dim,
      orbit,
      shift,
      shiftY,
      source,
    });
  }, [camera, day, focusX, focusY, dim, orbit, shift, shiftY, source]);
  return null;
}
