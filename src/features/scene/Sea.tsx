'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Palette } from '@/features/render';
import { clock } from './clock';
import { distanceField, type TileHistory } from './model';

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uWaves;
  varying vec3 vWorld;
  varying float vDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    world.y += (sin(world.x * 0.55 + uTime * 0.9) * 0.035 + cos(world.z * 0.42 - uTime * 0.7) * 0.035) * uWaves;
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uDist;
  uniform vec2 uGrid;
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTime;
  uniform float uNight;
  varying vec3 vWorld;
  varying float vDepth;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vWorld.xz / uGrid;
    float d = texture2D(uDist, uv).r * 16.0 - 0.5;
    vec3 col = mix(uShallow, uMid, smoothstep(0.1, 2.6, d));
    col = mix(col, uDeep, smoothstep(2.6, 11.0, d));

    float n = noise(vWorld.xz * 1.7 + uTime * 0.22);
    float foam = 1.0 - smoothstep(0.02, 0.16 + n * 0.14, d);
    float band = abs(fract(d * 0.7 - uTime * 0.12) - 0.5);
    float ring = (1.0 - smoothstep(0.0, 0.05, band - 0.45)) * (1.0 - smoothstep(0.2, 1.4, d)) * 0.18;
    col = mix(col, uFoam, clamp(foam + ring, 0.0, 1.0));

    float ripple = noise(vWorld.xz * 0.9 + vec2(uTime * 0.18, uTime * 0.11)) - 0.5;
    col += ripple * 0.03;

    float f = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFog, f);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface Props {
  width: number;
  height: number;
  histories: TileHistory[];
  palette: Palette;
  fog: string;
  night: boolean;
  still: boolean;
}

/** The sea: one big plane, coloured by distance to the island, with a foam line that follows the coast. */
export function Sea({ width, height, histories, palette, fog, night, still }: Props) {
  const texture = useMemo(() => {
    const data = new Uint8Array(width * height);
    const tex = new THREE.DataTexture(data, width, height, THREE.RedFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [width, height]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uDist: { value: texture },
          uGrid: { value: new THREE.Vector2(width, height) },
          uDeep: { value: new THREE.Color() },
          uMid: { value: new THREE.Color() },
          uShallow: { value: new THREE.Color() },
          uFoam: { value: new THREE.Color() },
          uFog: { value: new THREE.Color() },
          uFogNear: { value: 55 },
          uFogFar: { value: 250 },
          uTime: { value: 0 },
          uNight: { value: 0 },
          uWaves: { value: 1 },
        },
      }),
    [texture, width, height],
  );

  useEffect(() => {
    const u = material.uniforms;
    (u.uDeep?.value as THREE.Color).set(night ? '#0a2336' : palette.sea0);
    (u.uMid?.value as THREE.Color).set(night ? '#123a55' : palette.sea1);
    (u.uShallow?.value as THREE.Color).set(night ? '#1f5b73' : palette.sea2);
    (u.uFoam?.value as THREE.Color).set(night ? '#b9d7e6' : palette.foam);
    (u.uFog?.value as THREE.Color).set(fog);
    if (u.uNight) u.uNight.value = night ? 1 : 0;
    if (u.uWaves) u.uWaves.value = still ? 0 : 1;
  }, [material, palette, fog, night, still]);

  const lastDay = useMemo(() => ({ value: Number.NaN }), []);

  useFrame((_, delta) => {
    const u = material.uniforms;
    if (u.uTime && !still) u.uTime.value += delta;
    const day = Math.round(clock.day);
    if (day !== lastDay.value) {
      const dist = distanceField(width, height, histories, day);
      const data = texture.image.data as Uint8Array;
      for (let i = 0; i < dist.length; i++) data[i] = Math.round((Math.min(16, dist[i] as number) / 16) * 255);
      texture.needsUpdate = true;
      lastDay.value = day;
    }
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]} receiveShadow>
      <planeGeometry args={[720, 720, 256, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
