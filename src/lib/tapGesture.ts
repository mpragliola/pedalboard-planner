export interface TapPoint {
  time: number;
  x: number;
  y: number;
}

export interface DoubleTapThreshold {
  windowMs: number;
  maxDistancePx: number;
}

/**
 * Shared double-tap detector used by pointer/touch interactions.
 *
 * Why centralize:
 * - removes duplicated time+distance math across components
 * - keeps threshold behavior consistent and easy to test
 * - lets each feature provide its own threshold values while sharing logic
 */
export function isDoubleTapWithinThreshold(
  previousTap: TapPoint | null,
  currentTap: TapPoint,
  threshold: DoubleTapThreshold
): boolean {
  if (!previousTap) return false;
  if (currentTap.time - previousTap.time > threshold.windowMs) return false;
  return Math.hypot(currentTap.x - previousTap.x, currentTap.y - previousTap.y) <= threshold.maxDistancePx;
}

