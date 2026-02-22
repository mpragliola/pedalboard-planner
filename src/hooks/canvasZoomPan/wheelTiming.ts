/**
 * Pure timing/math helpers for wheel zoom behavior.
 * Kept separate so throttle decisions can be unit-tested without React/timers.
 */
interface WheelApplyDelayOptions {
  /** Whether at least one apply has already happened in current wheel burst. */
  hasApplied: boolean;
  /** Timestamp (performance.now) of last apply. */
  lastApplyAt: number;
  /** Timestamp (performance.now) for the current wheel event. */
  now: number;
  /** Minimum ms gap between applies while wheel stream is active. */
  throttleMs: number;
}

export function getWheelApplyDelay({ hasApplied, lastApplyAt, now, throttleMs }: WheelApplyDelayOptions): number {
  // First apply in a burst should be immediate for responsiveness.
  if (!hasApplied) return 0;
  // Subsequent applies respect throttle interval.
  const elapsed = now - lastApplyAt;
  if (elapsed >= throttleMs) return 0;
  return throttleMs - elapsed;
}

export function normalizeWheelDelta(deltaMode: number, deltaY: number): number {
  // `deltaMode === 1` means line units, scale to approximate pixel input.
  // Negation keeps "scroll up => zoom in" direction consistent with existing behavior.
  return deltaMode === 1 ? -deltaY * 32 : -deltaY;
}
