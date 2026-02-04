/** Normalize rotation to 0–359 range. */
export function normalizeRotation(r: number): number {
  return ((r % 360) + 360) % 360;
}
