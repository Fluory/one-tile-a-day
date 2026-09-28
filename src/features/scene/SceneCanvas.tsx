'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { World } from '@/features/world';
import { useReducedMotion } from '@/shared/motion';
import { AnimatedThings } from './Animated';
import { Blocks } from './Blocks';
import { CameraRig } from './CameraRig';
import { clock } from './clock';
import { elementBlocks } from './elementBlocks';
import { landBounds, paletteAtDay, seasonAtDay, tileHistories } from './model';
import { Sea } from './Sea';
import { Sky } from './Sky';
import { activeWorld, useScene } from './store';
import { Terrain } from './Terrain';

const FOG = { day: '#d3e7ea', night: '#12283c' };

/** Eases the displayed day towards the requested one – the island grows instead of jumping. */
function DayDirector({ world, still }: { world: World; still: boolean }) {
  useFrame((_, delta) => {
    const last = world.days[world.days.length - 1]?.day ?? 0;
    const wanted = useScene.getState().day;
    const target = Math.max(0, Math.min(Number.isFinite(wanted) ? wanted : last, last));
    clock.target = target;
    const gap = target - clock.day;
    if (still || Math.abs(gap) < 0.0005) {
      clock.day = target;
    } else {
      const dt = Math.min(delta, 0.1);
      const eased = gap * (1 - Math.exp(-dt * 4));
      const minimum = Math.sign(gap) * Math.min(Math.abs(gap), dt * 2.5);
      clock.day += Math.abs(eased) > Math.abs(minimum) ? eased : minimum;
    }
  }, -1);
  return null;
}

function Lights({ center, radius, night }: { center: THREE.Vector3; radius: number; night: boolean }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    target.position.copy(center);
    target.updateMatrixWorld();
  }, [center, target]);
  const r = radius + 5;
  return (
    <>
      <primitive object={target} />
      <hemisphereLight args={night ? ['#9ab4e6', '#1c2c3e', 1.05] : ['#e3f4ff', '#f1d9ad', 1.15]} />
      <directionalLight
        color={night ? '#d3deff' : '#fff0d6'}
        intensity={night ? 1.6 : 2.5}
        position={[center.x + (night ? -9 : 11), 16, center.z + (night ? -8 : 7)]}
        target={target}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
        shadow-camera-left={-r}
        shadow-camera-right={r}
        shadow-camera-top={r}
        shadow-camera-bottom={-r}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
    </>
  );
}

function Island({ world, night, still }: { world: World; night: boolean; still: boolean }) {
  const histories = useMemo(() => tileHistories(world), [world]);
  const [season, setSeason] = useState(() => seasonAtDay(world, clock.day));
  useFrame(() => {
    const s = seasonAtDay(world, clock.day);
    if (s !== season) setSeason(s);
  });
  const palette = useMemo(() => paletteAtDay(world, clock.day), [world, season]); // eslint-disable-line react-hooks/exhaustive-deps
  const { blocks, animated } = useMemo(() => elementBlocks(world, palette), [world, palette]);
  const bounds = useMemo(() => landBounds(histories, world.days[world.days.length - 1]?.day ?? 0), [histories, world]);
  const center = useMemo(() => new THREE.Vector3(bounds.cx, 0, bounds.cz), [bounds]);

  return (
    <>
      <DayDirector world={world} still={still} />
      <Lights center={center} radius={bounds.radius} night={night} />
      <Terrain histories={histories} palette={palette} instant={still} />
      <Blocks blocks={blocks} night={night} instant={still} />
      <AnimatedThings things={animated} night={night} still={still} />
      <Sea
        width={world.width}
        height={world.height}
        histories={histories}
        palette={palette}
        fog={night ? FOG.night : FOG.day}
        night={night}
        still={still}
      />
      <Sky center={center} night={night} still={still} />
      <CameraRig histories={histories} still={still} />
    </>
  );
}

export default function SceneCanvas() {
  const world = useScene((s) => activeWorld(s));
  const night = useScene((s) => s.night);
  const dim = useScene((s) => s.dim);
  const still = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (useScene.getState().real) return;
    let cancelled = false;
    fetch('/data/world.json')
      .then((r) => r.json() as Promise<World>)
      .then((w) => {
        if (!cancelled) useScene.getState().set({ real: w });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: ready ? 1 - dim * 0.6 : 0,
        transform: `scale(${1 + dim * 0.03})`,
        transition: 'opacity 900ms cubic-bezier(.22,1,.36,1), transform 900ms cubic-bezier(.22,1,.36,1)',
      }}
    >
      {world && (
        <Canvas
          shadows
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ fov: 36, near: 0.1, far: 600, position: [40, 16, 52] }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor(0x000000, 0);
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            requestAnimationFrame(() => setReady(true));
          }}
        >
          <fog attach="fog" args={[night ? FOG.night : FOG.day, 55, 250]} />
          <Island world={world} night={night} still={still} />
        </Canvas>
      )}
    </div>
  );
}
