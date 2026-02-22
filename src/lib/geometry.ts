/** Generic 2D geometry helpers shared by UI and snapping code. */
/**
 * Note: bounds computation helpers were intentionally moved to `bounds.ts`
 * so there is one canonical source for axis-aligned bounds logic.
 */

/** Normalize rotation to 0-359 range. */
export function normalizeRotation(r: number): number {
  return ((r % 360) + 360) % 360;
}
