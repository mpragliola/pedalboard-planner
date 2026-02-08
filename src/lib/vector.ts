// Shared vector types for geometry utilities.
export type Vector = { x: number; y: number };
export type Vec2d = Vector;
export type Vec2 = Vec2d;
export type Point = Vec2d;
export type Size = Vector;
export type Offset = Vector;
export type Vec3 = { x: number; y: number; z: number };

/** Canonical UVs for a unit square, clockwise from top-left. */
export const UNIT_SQUARE_UV: readonly Vec2[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
] as const;

/** Component-wise addition for 2D vectors. */
export function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Component-wise subtraction for 2D vectors. */
export function vec2Sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** Multiply a 2D vector by a scalar. */
export function vec2Scale(v: Vec2, factor: number): Vec2 {
  return { x: v.x * factor, y: v.y * factor };
}

/** Euclidean length of a 2D vector. */
export function vec2Length(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

/** Unit-length direction for a 2D vector (or zero vector for zero input). */
export function vec2Normalize(v: Vec2): Vec2 {
  const len = vec2Length(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/** Component-wise multiply for 2D vectors. */
export function vec2Multiply(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x * b.x, y: a.y * b.y };
}

/** 2D cross product magnitude (signed area). */
export function vec2Cross(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}

/** 2D dot product */
export function vec2Dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

/** Rotate a 2D vector around origin by radians. */
export function vec2Rotate(v: Vec2, radians: number): Vec2 {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
}

/** Returns the arithmetic mean of a list of 2D points (or zero vector for empty input). */
export function vec2Average(points: readonly Vec2[]): Vec2 {
  let sum = { x: 0, y: 0 };
  if (points.length === 0) return sum;
  for (const point of points) {
    sum = vec2Add(sum, point);
  }
  return vec2Scale(sum, 1 / points.length);
}

/** Component-wise addition for 3D vectors. */
export function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/** Component-wise subtraction for 3D vectors. */
export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/** Dot product for 3D vectors. */
export function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** Cross product for 3D vectors. */
export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** Euclidean length of a 3D vector. */
export function vec3Length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

/** Unit-length direction for a 3D vector (or zero vector for zero input). */
export function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Arithmetic mean of 3D points (or zero vector for empty input). */
export function vec3Average(points: readonly Vec3[]): Vec3 {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumZ += point.z;
  }
  const n = points.length;
  return { x: sumX / n, y: sumY / n, z: sumZ / n };
}
