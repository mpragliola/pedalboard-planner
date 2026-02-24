/** Generic 2D geometry helpers shared by UI and snapping code. */
/**
 * Note: bounds computation helpers were intentionally moved to `bounds.ts`
 * so there is one canonical source for axis-aligned bounds logic.
 */
import type { Point } from "./vector";
import { clamp } from "./math";

export type Rect = { minX: number; minY: number; maxX: number; maxY: number };

/** Normalize rotation to 0-359 range. */
export function normalizeRotation(r: number): number {
  return ((r % 360) + 360) % 360;
}

/** True only when rect interiors overlap (edge-touching is not overlap). */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(a.maxX <= b.minX || a.minX >= b.maxX || a.maxY <= b.minY || a.minY >= b.maxY);
}

/** Direction (dx, dy) normalized then scaled by distanceFactor. */
export function getDirectionalOffset(
  dx: number,
  dy: number,
  distanceFactor: number
): { offsetX: number; offsetY: number } {
  const dist = Math.hypot(dx, dy) || 1;
  return {
    offsetX: (dx / dist) * distanceFactor,
    offsetY: (dy / dist) * distanceFactor,
  };
}

/** Closest point on the perimeter of a rectangle to (px, py). */
export function closestPointOnRectPerimeter(
  px: number,
  py: number,
  left: number,
  top: number,
  width: number,
  height: number
): Point {
  const right = left + width;
  const bottom = top + height;
  const cx = clamp(px, left, right);
  const cy = clamp(py, top, bottom);
  const inside = px > left && px < right && py > top && py < bottom;
  if (inside) {
    const dl = cx - left;
    const dr = right - cx;
    const dt = cy - top;
    const db = bottom - cy;
    const minHoriz = Math.min(dl, dr);
    const minVert = Math.min(dt, db);
    if (minHoriz <= minVert) {
      return { x: px < left + width / 2 ? left : right, y: cy };
    }
    return { x: cx, y: py < top + height / 2 ? top : bottom };
  }
  return { x: cx, y: cy };
}
