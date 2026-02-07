/** Shared helpers for computing 2D axis-aligned bounds from points and rects. */
import type { Rect } from "./geometry2d";
import type { Vec2 } from "./vector";

/** Axis-aligned bounds in 2D space. */
export type Bounds2D = Rect;

type BoundsAccumulator = {
  hasValues: boolean;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function createBoundsAccumulator(): BoundsAccumulator {
  return {
    hasValues: false,
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
}

/** Extend accumulator with explicit extents. */
function includeBoundsExtents(
  acc: BoundsAccumulator,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): void {
  acc.hasValues = true;
  acc.minX = Math.min(acc.minX, minX);
  acc.minY = Math.min(acc.minY, minY);
  acc.maxX = Math.max(acc.maxX, maxX);
  acc.maxY = Math.max(acc.maxY, maxY);
}

function includeBoundsFromPoints(acc: BoundsAccumulator, points: Iterable<Vec2>): void {
  for (const point of points) {
    includeBoundsExtents(acc, point.x, point.y, point.x, point.y);
  }
}

function finalizeBounds(acc: BoundsAccumulator): Bounds2D | null {
  if (!acc.hasValues) return null;
  if (!Number.isFinite(acc.minX) || !Number.isFinite(acc.minY) || !Number.isFinite(acc.maxX) || !Number.isFinite(acc.maxY)) {
    return null;
  }
  return { minX: acc.minX, minY: acc.minY, maxX: acc.maxX, maxY: acc.maxY };
}

/** Bounds of a flat set of points. Returns null for empty or non-finite input. */
export function getBounds2DOfPoints(points: Iterable<Vec2>): Bounds2D | null {
  const acc = createBoundsAccumulator();
  includeBoundsFromPoints(acc, points);
  return finalizeBounds(acc);
}

/** Bounds of nested point lists. Returns null for empty or non-finite input. */
export function getBounds2DOfPointSets(pointSets: Iterable<readonly Vec2[]>): Bounds2D | null {
  const acc = createBoundsAccumulator();
  for (const points of pointSets) {
    includeBoundsFromPoints(acc, points);
  }
  return finalizeBounds(acc);
}

/** Bounds of existing rects. Returns null for empty or non-finite input. */
export function getBounds2DOfRects(rects: Iterable<Rect>): Bounds2D | null {
  const acc = createBoundsAccumulator();
  for (const rect of rects) {
    includeBoundsExtents(acc, rect.minX, rect.minY, rect.maxX, rect.maxY);
  }
  return finalizeBounds(acc);
}

/** Center point of bounds. */
export function getBounds2DCenter(bounds: Bounds2D): Vec2 {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/** Width/height span of bounds. */
export function getBounds2DSize(bounds: Bounds2D): { width: number; height: number } {
  return {
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}
