// Small math helpers shared across UI and rendering code.

// Clamp a number into a range.
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Cubic ease-out curve for animation timing.
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
