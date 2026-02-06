import { getBounds2DOfPoints, type Bounds2D } from "./bounds";
import type { Vec2 } from "./vector";

/** Normalize rotation to 0-359 range. */
export function normalizeRotation(r: number): number {
  return ((r % 360) + 360) % 360;
}

export type BoundingBox = Bounds2D;

export type Segment2D = { x1: number; y1: number; x2: number; y2: number };

function* segmentEndpoints(segments: Iterable<Segment2D>): Iterable<Vec2> {
  for (const segment of segments) {
    yield { x: segment.x1, y: segment.y1 };
    yield { x: segment.x2, y: segment.y2 };
  }
}

/** Axis-aligned bounding box of a set of points. Returns null if empty or invalid. */
export function getBoundingBoxOfPoints(points: Iterable<Vec2>): BoundingBox | null {
  return getBounds2DOfPoints(points);
}

/** Axis-aligned bounding box of a set of segments (all segment endpoints). Returns null if no segments or invalid. */
export function getBoundingBoxOfSegments(segments: Iterable<Segment2D>): BoundingBox | null {
  return getBounds2DOfPoints(segmentEndpoints(segments));
}
