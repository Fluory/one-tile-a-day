'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { appear, clock, easeOutBack } from './clock';
import type { Animated as AnimatedThing } from './model';

/** Windmill sails, bobbing boats, circling gulls and the lighthouse beam – the few things that move. */

function Visible({ from, children }: { from: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = appear(clock.day, from);
    const k = p <= 0 ? 0.0001 : Math.max(0.0001, easeOutBack(p));
    ref.current?.scale.setScalar(k);
  });
  return <group ref={ref}>{children}</group>;
}

function Blades({ thing, still }: { thing: AnimatedThing; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && !still) ref.current.rotation.z -= delta * 1.1;
  });
  return (
    <group position={[thing.x, thing.height, thing.y]}>
      <Visible from={thing.from}>
        <group ref={ref}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0.02]} castShadow>
              <boxGeometry args={[0.07, 0.72, 0.02]} />
              <meshStandardMaterial color="#f4efe2" roughness={0.9} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#6d4a2f" />
          </mesh>
        </group>
      </Visible>
    </group>
  );
}

function Boat({ thing, still }: { thing: AnimatedThing; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const seed = thing.x * 13.1 + thing.y * 7.7;
  useFrame(({ clock: c }) => {
    if (!ref.current || still) return;
    const t = c.elapsedTime + seed;
    ref.current.position.y = Math.sin(t * 1.4) * 0.03 + 0.06;
    ref.current.rotation.z = Math.sin(t * 1.1) * 0.06;
    ref.current.rotation.x = Math.cos(t * 0.9) * 0.04;
  });
  return (
    <group position={[thing.x, 0, thing.y]}>
      <Visible from={thing.from}>
        <group ref={ref} rotation={[0, seed % Math.PI, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.14, 0.24]} />
            <meshStandardMaterial color="#946842" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.56, 6]} />
            <meshStandardMaterial color="#3b2a1d" />
          </mesh>
          <mesh position={[0.1, 0.36, 0]} rotation={[0, 0, 0]} castShadow>
            <coneGeometry args={[0.16, 0.44, 3]} />
            <meshStandardMaterial color={thing.color ?? '#f4efe2'} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Visible>
    </group>
  );
}

function Gull({ thing, still }: { thing: AnimatedThing; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group>(null);
  const seed = thing.x * 3.7 + thing.y * 5.3;
  useFrame(({ clock: c }) => {
    if (!ref.current || still) return;
    const t = c.elapsedTime * 0.35 + seed;
    const r = 2.2 + (seed % 1.5);
    ref.current.position.set(
      thing.x + Math.cos(t) * r,
      thing.height + Math.sin(t * 2) * 0.15,
      thing.y + Math.sin(t) * r,
    );
    ref.current.rotation.y = -t;
    if (wings.current) wings.current.rotation.z = Math.sin(c.elapsedTime * 7 + seed) * 0.45;
  });
  return (
    <group ref={ref} position={[thing.x, thing.height, thing.y]}>
      <Visible from={thing.from}>
        <mesh>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color={thing.color ?? '#ffffff'} />
        </mesh>
        <group ref={wings}>
          <mesh position={[0, 0, 0.13]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.07, 0.01, 0.24]} />
            <meshStandardMaterial color="#e8ecef" />
          </mesh>
          <mesh position={[0, 0, -0.13]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.07, 0.01, 0.24]} />
            <meshStandardMaterial color="#e8ecef" />
          </mesh>
        </group>
      </Visible>
    </group>
  );
}

const beamVertex = /* glsl */ `
  varying float vAlong;
  void main() {
    vAlong = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const beamFragment = /* glsl */ `
  varying float vAlong;
  void main() {
    float a = pow(vAlong, 1.8) * 0.28;
    gl_FragColor = vec4(1.0, 0.95, 0.72, a);
  }
`;

function Beam({ thing, night, still }: { thing: AnimatedThing; night: boolean; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useFrame((_, delta) => {
    if (ref.current && !still) ref.current.rotation.y += delta * 0.8;
  });
  if (!night) return null;
  return (
    <group position={[thing.x, thing.height, thing.y]}>
      <Visible from={thing.from}>
        <pointLight color="#ffe7a3" intensity={6} distance={9} decay={1.6} />
        <group ref={ref}>
          <mesh position={[3.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
            <coneGeometry args={[0.9, 6.4, 24, 1, true]} />
          </mesh>
        </group>
      </Visible>
    </group>
  );
}

export function AnimatedThings({ things, night, still }: { things: AnimatedThing[]; night: boolean; still: boolean }) {
  return (
    <>
      {things.map((t, i) => {
        const key = `${t.kind}-${t.x}-${t.y}-${i}`;
        switch (t.kind) {
          case 'blades':
            return <Blades key={key} thing={t} still={still} />;
          case 'boat':
            return <Boat key={key} thing={t} still={still} />;
          case 'gull':
            return <Gull key={key} thing={t} still={still} />;
          case 'beam':
            return <Beam key={key} thing={t} night={night} still={still} />;
        }
      })}
    </>
  );
}
