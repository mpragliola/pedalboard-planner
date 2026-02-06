import type { Vec2, Vec3 } from "./vector";
import { vec3Average, vec3Cross, vec3Dot, vec3Length, vec3Normalize, vec3Sub } from "./vector";

export type Camera = {
  pos: Vec3;
  right: Vec3;
  up: Vec3;
  forward: Vec3;
  fov: number;
};

export const CAMERA_FOV_DEG = 36;

export { vec3Sub, vec3Dot, vec3Cross, vec3Length, vec3Normalize };

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
  return vec3Average(points);
}

export function isFaceVisible(points: Vec3[], normal: Vec3, camera: Camera): boolean {
  const center = faceCenter(points);
  const viewDir = vec3Normalize(vec3Sub(camera.pos, center));
  return vec3Dot(normal, viewDir) > 0;
}
