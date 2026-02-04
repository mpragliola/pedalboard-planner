/** Normalize rotation to 0–359 range. */
export function normalizeRotation(r: number): number {
  return ((r % 360) + 360) % 360;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Axis-aligned bounding box of a set of points. Returns null if empty. */
export function getBoundingBoxOfPoints(points: { x: number; y: number }[]): BoundingBox | null {
  if (points.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

/** Axis-aligned bounding box of a set of segments (all segment endpoints). Returns null if no segments. */
export function getBoundingBoxOfSegments(
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>
): BoundingBox | null {
  if (segments.length === 0) return null;
  const points = segments.flatMap((s) => [
    { x: s.x1, y: s.y1 },
    { x: s.x2, y: s.y2 },
  ]);
  return getBoundingBoxOfPoints(points);
}
