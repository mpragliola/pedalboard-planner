/** Lightweight 2D geometry helpers used by layout and snapping logic. */
export type Rect = { minX: number; minY: number; maxX: number; maxY: number };

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
