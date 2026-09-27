'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { appear, clock, easeOutBack } from './clock';
import { geometries } from './geometries';
import type { Block, GeoKey } from './model';

interface GroupProps {
  geo: GeoKey;
  blocks: Block[];
  glow: boolean;
  night: boolean;
  instant: boolean;
}

function BlockGroup({ geo, blocks, glow, night, instant }: GroupProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const applied = useRef(Number.NaN);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(
    () =>
      glow
        ? new THREE.MeshBasicMaterial({ toneMapped: false })
        : new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, flatShading: true }),
    [glow],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const color = new THREE.Color();
    blocks.forEach((b, i) => {
      color.set(b.color);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    applied.current = Number.NaN;
  }, [blocks]);

  useLayoutEffect(() => {
    if (material instanceof THREE.MeshBasicMaterial) material.color.setScalar(night ? 1.6 : 0.95);
  }, [material, night]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const day = clock.day;
    if (Math.abs(day - applied.current) < 0.0005) return;
    blocks.forEach((b, i) => {
      const p = instant ? (day >= b.from ? 1 : 0) : appear(day, b.from);
      const k = p <= 0 ? 0.0001 : Math.max(0.0001, easeOutBack(p));
      dummy.position.set(b.pos[0], b.pos[1] - (1 - p) * 0.35, b.pos[2]);
      dummy.rotation.set(0, b.rotY ?? 0, 0);
      dummy.scale.set(b.scale[0] * k, b.scale[1] * k, b.scale[2] * k);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    applied.current = day;
  });

  return (
    <instancedMesh
      key={blocks.length}
      ref={ref}
      args={[geometries()[geo], material, blocks.length]}
      castShadow={!glow}
      receiveShadow={!glow}
      frustumCulled={false}
    />
  );
}

/** All buildings, trees, people and animals – grouped by shape, one draw call per group. */
export function Blocks({ blocks, night, instant }: { blocks: Block[]; night: boolean; instant: boolean }) {
  const groups = useMemo(() => {
    const map = new Map<string, { geo: GeoKey; glow: boolean; blocks: Block[] }>();
    for (const b of blocks) {
      const key = `${b.geo}:${b.glow ? 1 : 0}`;
      const group = map.get(key) ?? { geo: b.geo, glow: Boolean(b.glow), blocks: [] };
      group.blocks.push(b);
      map.set(key, group);
    }
    return [...map.entries()];
  }, [blocks]);

  return (
    <>
      {groups.map(([key, g]) => (
        <BlockGroup key={key} geo={g.geo} glow={g.glow} blocks={g.blocks} night={night} instant={instant} />
      ))}
    </>
  );
}
