import type { Point } from "./vector";

/**
 * Return the index of the segment [points[i], points[i + 1]] nearest to a point.
 * Returns null when fewer than 2 points are available.
 */
export function nearestSegmentIndexForPoint(points: Point[], target: Point): number | null {
  if (points.length < 2) return null;

  let bestIdx = 0;
  let bestDist2 = Infinity;

  for (let idx = 0; idx < points.length - 1; idx += 1) {
    const a = points[idx];
    const b = points[idx + 1];
    const abX = b.x - a.x;
    const abY = b.y - a.y;
    const apX = target.x - a.x;
    const apY = target.y - a.y;
    const len2 = abX * abX + abY * abY;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (apX * abX + apY * abY) / len2));
    const projX = a.x + t * abX;
    const projY = a.y + t * abY;
    const dx = target.x - projX;
    const dy = target.y - projY;
    const dist2 = dx * dx + dy * dy;
    if (dist2 < bestDist2) {
      bestDist2 = dist2;
      bestIdx = idx;
    }
  }

  return bestDist2 === Infinity ? null : bestIdx;
}
