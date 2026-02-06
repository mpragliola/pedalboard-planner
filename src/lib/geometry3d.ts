import type { Vec2, Vec3 } from "./vector";

export type Camera = {
  pos: Vec3;
  right: Vec3;
  up: Vec3;
  forward: Vec3;
  fov: number;
};

export const CAMERA_FOV_DEG = 36;

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vec3Length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function createCamera(
  center: Vec3,
  radius: number,
  yaw: number,
  pitch: number,
  fovDeg = CAMERA_FOV_DEG
): Camera {
  const cosPitch = Math.cos(pitch);
  const pos = {
    x: center.x + Math.cos(yaw) * cosPitch * radius,
    y: center.y + Math.sin(yaw) * cosPitch * radius,
    z: center.z + Math.sin(pitch) * radius,
  };
  const target = center;
  const forward = vec3Normalize(vec3Sub(target, pos));
  const upWorld = { x: 0, y: 0, z: 1 };
  let right = vec3Cross(forward, upWorld);
  if (vec3Length(right) < 1e-6) right = { x: 1, y: 0, z: 0 };
  right = vec3Normalize(right);
  const up = vec3Cross(right, forward);
  return {
    pos,
    right,
    up,
    forward,
    fov: (fovDeg * Math.PI) / 180,
  };
}

export function projectPerspective(p: Vec3, camera: Camera): Vec2 {
  const rel = vec3Sub(p, camera.pos);
  const xCam = vec3Dot(rel, camera.right);
  const yCam = vec3Dot(rel, camera.up);
  const zCam = Math.max(0.001, vec3Dot(rel, camera.forward));
  const f = 1 / Math.tan(camera.fov / 2);
  const scale = f / zCam;
  return { x: -xCam * scale, y: -yCam * scale };
}

export function faceDepth(points: Vec3[], camera: Camera): number {
  let sum = 0;
  for (const p of points) {
    sum += vec3Dot(vec3Sub(p, camera.pos), camera.forward);
  }
  return sum / points.length;
}

export function depthForPoint(p: Vec3, camera: Camera): number {
  return vec3Dot(vec3Sub(p, camera.pos), camera.forward);
}

export function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return vec3Normalize(vec3Cross(vec3Sub(b, a), vec3Sub(c, a)));
}

export function faceCenter(points: Vec3[]): Vec3 {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
    { x: 0, y: 0, z: 0 }
  );
  const n = points.length || 1;
  return { x: sum.x / n, y: sum.y / n, z: sum.z / n };
}

export function isFaceVisible(points: Vec3[], normal: Vec3, camera: Camera): boolean {
  const center = faceCenter(points);
  const viewDir = vec3Normalize(vec3Sub(camera.pos, center));
  return vec3Dot(normal, viewDir) > 0;
}
