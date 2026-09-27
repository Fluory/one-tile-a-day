'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clock } from './clock';
import { landBounds, type TileHistory } from './model';
import { useScene } from './store';

interface Props {
  histories: TileHistory[];
  still: boolean;
}

/**
 * The camera follows presets (hero, overview, top, focus, far) instead of free controls –
 * pages direct it, the rig eases between shots. A small pointer parallax keeps it alive.
 */
export function CameraRig({ histories, still }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const azimuth = useRef(0.7);
  const current = useRef({ pos: new THREE.Vector3(30, 14, 50), target: new THREE.Vector3(32, 0, 32), ready: false });
  const bounds = useRef({ day: Number.NaN, cx: 32, cz: 32, radius: 3 });
  const shift = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), target: new THREE.Vector3() }), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const { camera: preset, focus, orbit, shift: wantShift, shiftY: wantShiftY } = useScene.getState();
    const dt = Math.min(delta, 0.1);
    const day = Math.round(clock.day);
    if (day !== bounds.current.day) {
      bounds.current = { day, ...landBounds(histories, day) };
    }
    const { cx, cz, radius } = bounds.current;
    if (orbit && !still) azimuth.current += dt * 0.05;
    const p = pointer.current;
    p.x += (p.tx - p.x) * (1 - Math.exp(-dt * 3));
    p.y += (p.ty - p.y) * (1 - Math.exp(-dt * 3));

    let dist: number;
    let polar: number;
    tmp.target.set(cx, 0.35, cz);
    switch (preset) {
      case 'overview':
        dist = Math.max(17, radius * 4.4);
        polar = 1.12;
        break;
      case 'top':
        dist = Math.max(20, radius * 5);
        polar = 0.42;
        break;
      case 'focus':
        if (focus) tmp.target.set(focus.x + 0.5, 0.5, focus.y + 0.5);
        dist = 7;
        polar = 1.12;
        break;
      case 'far':
        dist = Math.max(38, radius * 9);
        polar = 1.36;
        break;
      default:
        dist = Math.max(15, radius * 4.2);
        polar = 1.3;
    }
    const az = azimuth.current + (still ? 0 : p.x * 0.18);
    const po = THREE.MathUtils.clamp(polar + (still ? 0 : p.y * 0.04), 0.12, 1.42);
    tmp.pos.set(
      tmp.target.x + dist * Math.sin(po) * Math.cos(az),
      tmp.target.y + dist * Math.cos(po),
      tmp.target.z + dist * Math.sin(po) * Math.sin(az),
    );

    const c = current.current;
    const k = c.ready ? 1 - Math.exp(-dt * (still ? 20 : 2.4)) : 1;
    c.pos.lerp(tmp.pos, k);
    c.target.lerp(tmp.target, k);
    c.ready = true;
    camera.position.copy(c.pos);
    camera.lookAt(c.target);

    const sh = shift.current;
    sh.x += (wantShift - sh.x) * (1 - Math.exp(-dt * 3));
    sh.y += (wantShiftY - sh.y) * (1 - Math.exp(-dt * 3));
    if (Math.abs(sh.x) > 0.001 || Math.abs(sh.y) > 0.001) {
      camera.setViewOffset(size.width, size.height, -sh.x * size.width, -sh.y * size.height, size.width, size.height);
    } else if (camera.view?.enabled) {
      camera.clearViewOffset();
    }
  });

  return null;
}
