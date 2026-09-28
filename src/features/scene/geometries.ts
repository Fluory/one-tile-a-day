'use client';

import * as THREE from 'three';
import type { GeoKey } from './model';

/**
 * One shared geometry per block shape. Every building, tree and animal on the island is
 * assembled from these six, so the whole island renders in a handful of draw calls.
 */

function prism(): THREE.BufferGeometry {
  // Gable roof: triangular cross-section (in Y/Z) extruded along X, unit-sized and centred.
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0, 0.5);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  geo.translate(0, 0, -0.5);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

let cache: Record<GeoKey, THREE.BufferGeometry> | undefined;

export function geometries(): Record<GeoKey, THREE.BufferGeometry> {
  if (cache) return cache;
  const cone4 = new THREE.ConeGeometry(0.5, 1, 4);
  cone4.rotateY(Math.PI / 4);
  cache = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
    cone8: new THREE.ConeGeometry(0.5, 1, 8),
    cone4,
    ico: new THREE.IcosahedronGeometry(0.5, 0),
    prism: prism(),
  };
  return cache;
}

/** Terrain tile: a unit box with a slightly bevelled top edge look via vertex offsets. */
let tileGeo: THREE.BufferGeometry | undefined;
export function tileGeometry(): THREE.BufferGeometry {
  tileGeo ??= new THREE.BoxGeometry(0.96, 1, 0.96);
  return tileGeo;
}
