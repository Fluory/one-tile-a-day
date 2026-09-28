'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { hashCell } from '@/features/world';

/** Drifting low-poly clouds by day, a dome of stars by night. */

function Cloud({
  seed,
  center,
  night,
  still,
}: {
  seed: number;
  center: THREE.Vector3;
  night: boolean;
  still: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: 4 + (seed % 3) }, (_, i) => ({
        x: i * 0.7 - 1 + ((hashCell(seed, i, 1) % 100) / 100) * 0.4,
        y: ((hashCell(seed, i, 2) % 100) / 100) * 0.35,
        z: ((hashCell(seed, i, 3) % 100) / 100) * 0.6 - 0.3,
        s: 0.7 + ((hashCell(seed, i, 4) % 100) / 100) * 0.6,
      })),
    [seed],
  );
  const start = useMemo(
    () => ({
      angle: ((hashCell(seed, 0, 5) % 360) * Math.PI) / 180,
      radius: 16 + (hashCell(seed, 0, 6) % 14),
      height: 9 + (hashCell(seed, 0, 7) % 40) / 10,
      speed: 0.008 + (hashCell(seed, 0, 8) % 10) / 1500,
    }),
    [seed],
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = start.angle + (still ? 0 : clock.elapsedTime * start.speed);
    ref.current.position.set(
      center.x + Math.cos(a) * start.radius,
      start.height,
      center.z + Math.sin(a) * start.radius,
    );
  });
  return (
    <group ref={ref}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={[p.s * 1.2, p.s * 0.8, p.s]}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshLambertMaterial
            color={night ? '#2c4460' : '#ffffff'}
            emissive={night ? '#0d1a28' : '#dfe8ee'}
            flatShading
            transparent
            opacity={night ? 0.5 : 0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

function Stars({ center }: { center: THREE.Vector3 }) {
  const geometry = useMemo(() => {
    const count = 520;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = (hashCell(i, 1, 90) % 10000) / 10000;
      const v = (hashCell(i, 2, 91) % 10000) / 10000;
      const theta = u * Math.PI * 2;
      const phi = Math.acos(1 - v * 0.95);
      const r = 140;
      positions[i * 3] = center.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 4;
      positions[i * 3 + 2] = center.z + r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [center]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#fff6dc" size={0.9} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

export function Sky({ center, night, still }: { center: THREE.Vector3; night: boolean; still: boolean }) {
  return (
    <>
      {[11, 23, 37, 51, 64].map((seed) => (
        <Cloud key={seed} seed={seed} center={center} night={night} still={still} />
      ))}
      {night && <Stars center={center} />}
    </>
  );
}
