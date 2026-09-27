'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Palette } from '@/features/render';
import { hashCell, type Terrain as TerrainType } from '@/features/world';
import { appear, clock, easeOutBack, easeOutCubic } from './clock';
import { tileGeometry } from './geometries';
import { HEIGHT, terrainAtDay, type TileHistory } from './model';

const BASE = 1.4; // how far tiles reach below the sea surface

const COLOR_KEY: Record<Exclude<TerrainType, 'water'>, keyof Palette> = {
  sand: 'sand1',
  grass: 'grass1',
  forest: 'forest0',
  rock: 'rock1',
};

interface Props {
  histories: TileHistory[];
  palette: Palette;
  instant: boolean;
}

/** Every land tile is a block that rises out of the sea on the day it appeared. */
export function Terrain({ histories, palette, instant }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const applied = useRef({ day: Number.NaN, palette: null as Palette | null });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, flatShading: true }),
    [],
  );

  useLayoutEffect(() => {
    applied.current.day = Number.NaN;
  }, [histories, palette]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const day = clock.day;
    if (Math.abs(day - applied.current.day) < 0.0005 && applied.current.palette === palette) return;
    histories.forEach((h, i) => {
      const first = h.states[0]?.day ?? 0;
      const p = instant ? (day >= first ? 1 : 0) : appear(day, first);
      const state = terrainAtDay(h, Math.max(first, day + 0.5)) ?? h.states[0];
      const terrain = (state?.terrain ?? 'sand') as Exclude<TerrainType, 'water'>;
      const height = HEIGHT[terrain] + (terrain === 'rock' ? ((hashCell(h.x, h.y, 70) % 100) / 100) * 0.25 : 0);
      const rise = (1 - easeOutCubic(p)) * (height + BASE + 0.2);
      const s = p <= 0 ? 0.0001 : Math.max(0.0001, easeOutBack(p));
      dummy.position.set(h.x + 0.5, (height - BASE) / 2 - rise, h.y + 0.5);
      dummy.scale.set(s, height + BASE, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const shade = ((hashCell(h.x, h.y, 71) % 100) / 100 - 0.5) * 0.08;
      color.set(palette[COLOR_KEY[terrain]] as string).offsetHSL(0, 0, shade);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    applied.current = { day, palette };
  });

  if (histories.length === 0) return null;
  return (
    <instancedMesh
      key={histories.length}
      ref={ref}
      args={[tileGeometry(), material, histories.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}
