import * as THREE from "three";
import { BASE_URL } from "../../constants";
import { clamp } from "../../lib/math";
import { CONVERGENCE_OFFSET_DISTANCE } from "./mini3dConstants";
import type { SceneBox } from "./mini3dTypes";

export function setOrbitPosition(
  out: THREE.Vector3,
  yaw: number,
  pitch: number,
  distance: number,
  targetY: number
): THREE.Vector3 {
  out.set(
    distance * Math.cos(pitch) * Math.sin(yaw),
    targetY + distance * Math.sin(pitch),
    distance * Math.cos(pitch) * Math.cos(yaw)
  );
  return out;
}

function appendBoxCorners(
  out: THREE.Vector3[],
  box: SceneBox,
  offsetX = 0,
  offsetZ = 0
): void {
  const halfW = box.width / 2;
  const halfH = box.height / 2;
  const halfD = box.depth / 2;
  const cosR = Math.cos(box.rotY);
  const sinR = Math.sin(box.rotY);

  const xs = [-halfW, halfW];
  const ys = [-halfH, halfH];
  const zs = [-halfD, halfD];

  for (const lx of xs) {
    for (const ly of ys) {
      for (const lz of zs) {
        const rx = lx * cosR - lz * sinR;
        const rz = lx * sinR + lz * cosR;
        out.push(new THREE.Vector3(box.x + offsetX + rx, box.y + ly, box.z + offsetZ + rz));
      }
    }
  }
}

function computeConvergenceOffset(x: number, z: number): { x: number; z: number } {
  const magnitude = Math.hypot(x, z) || 1;
  return {
    x: (x / magnitude) * CONVERGENCE_OFFSET_DISTANCE,
    z: (z / magnitude) * CONVERGENCE_OFFSET_DISTANCE,
  };
}

export function computeBoxCorners(
  boxes: SceneBox[],
  includeConvergenceExtremes = false
): THREE.Vector3[] {
  const corners: THREE.Vector3[] = [];

  for (const box of boxes) {
    appendBoxCorners(corners, box);

    if (includeConvergenceExtremes) {
      const offset = computeConvergenceOffset(box.x, box.z);
      if (Math.abs(offset.x) > 1e-6 || Math.abs(offset.z) > 1e-6) {
        appendBoxCorners(corners, box, offset.x, offset.z);
      }
    }
  }

  return corners;
}

export function easeOutCubic(value: number): number {
  const t = clamp(value, 0, 1);
  return 1 - (1 - t) ** 3;
}

export function shortestAngleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function resolveImageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}
