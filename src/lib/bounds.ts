import type { Rect } from "./geometry2d";
import type { Vec2 } from "./vector";

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

function includeBoundsPoint(acc: BoundsAccumulator, x: number, y: number): void {
  acc.hasValues = true;
  acc.minX = Math.min(acc.minX, x);
  acc.minY = Math.min(acc.minY, y);
  acc.maxX = Math.max(acc.maxX, x);
  acc.maxY = Math.max(acc.maxY, y);
}

function includeBoundsRect(acc: BoundsAccumulator, rect: Rect): void {
  acc.hasValues = true;
  acc.minX = Math.min(acc.minX, rect.minX);
  acc.minY = Math.min(acc.minY, rect.minY);
  acc.maxX = Math.max(acc.maxX, rect.maxX);
  acc.maxY = Math.max(acc.maxY, rect.maxY);
}

function finalizeBounds(acc: BoundsAccumulator): Bounds2D | null {
  if (!acc.hasValues) return null;
  if (!Number.isFinite(acc.minX) || !Number.isFinite(acc.minY) || !Number.isFinite(acc.maxX) || !Number.isFinite(acc.maxY)) {
    return null;
  }
  return { minX: acc.minX, minY: acc.minY, maxX: acc.maxX, maxY: acc.maxY };
}

export function getBounds2DOfPoints(points: Iterable<Vec2>): Bounds2D | null {
  const acc = createBoundsAccumulator();
  for (const point of points) {
    includeBoundsPoint(acc, point.x, point.y);
  }
  return finalizeBounds(acc);
}

export function getBounds2DOfPointSets(pointSets: Iterable<readonly Vec2[]>): Bounds2D | null {
  const acc = createBoundsAccumulator();
  for (const points of pointSets) {
    for (const point of points) {
      includeBoundsPoint(acc, point.x, point.y);
    }
  }
  return finalizeBounds(acc);
}

export function getBounds2DOfRects(rects: Iterable<Rect>): Bounds2D | null {
  const acc = createBoundsAccumulator();
  for (const rect of rects) {
    includeBoundsRect(acc, rect);
  }
  return finalizeBounds(acc);
}

export function getBounds2DCenter(bounds: Bounds2D): Vec2 {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

export function getBounds2DSize(bounds: Bounds2D): { width: number; height: number } {
  return {
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}
