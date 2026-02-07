/** Generic 2D geometry helpers shared by UI and snapping code. */
import { getBounds2DOfPoints, type Bounds2D } from "./bounds";
import type { Point } from "./vector";

/** Normalize rotation to 0-359 range. */
export function normalizeRotation(r: number): number {
  return ((r % 360) + 360) % 360;
}

/** Axis-aligned bounding box alias used by legacy geometry APIs. */
export type BoundingBox = Bounds2D;

/** One 2D line segment by endpoint points. */
export type Segment2D = { start: Point; end: Point };

function* segmentEndpoints(segments: Iterable<Segment2D>): Iterable<Point> {
  for (const segment of segments) {
    yield segment.start;
    yield segment.end;
  }
}

/** Axis-aligned bounding box of a set of points. Returns null if empty or invalid. */
export function getBoundingBoxOfPoints(points: Iterable<Point>): BoundingBox | null {
  return getBounds2DOfPoints(points);
}

/** Axis-aligned bounding box of a set of segments (all segment endpoints). Returns null if no segments or invalid. */
export function getBoundingBoxOfSegments(segments: Iterable<Segment2D>): BoundingBox | null {
  return getBounds2DOfPoints(segmentEndpoints(segments));
}
