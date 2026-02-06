import type { Rect } from "./geometry2d";
import type { Vec2 } from "./vector";

export type Bounds2D = Rect;

export function getBounds2DOfPoints(points: Iterable<Vec2>): Bounds2D | null {
  let hasPoints = false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    hasPoints = true;
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  if (!hasPoints) return null;
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }
  return { minX, minY, maxX, maxY };
}

export function getBounds2DOfPointSets(pointSets: Iterable<readonly Vec2[]>): Bounds2D | null {
  let hasPoints = false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const points of pointSets) {
    for (const point of points) {
      hasPoints = true;
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  if (!hasPoints) return null;
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }
  return { minX, minY, maxX, maxY };
}

export function getBounds2DOfRects(rects: Iterable<Rect>): Bounds2D | null {
  let hasRects = false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const rect of rects) {
    hasRects = true;
    minX = Math.min(minX, rect.minX);
    minY = Math.min(minY, rect.minY);
    maxX = Math.max(maxX, rect.maxX);
    maxY = Math.max(maxY, rect.maxY);
  }
  if (!hasRects) return null;
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }
  return { minX, minY, maxX, maxY };
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
