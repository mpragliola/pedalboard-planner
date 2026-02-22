/**
 * Safe pointer-capture helpers.
 *
 * Pointer capture can throw when:
 * - pointer is no longer active
 * - target no longer owns capture
 * - browser/platform rejects capture transition
 *
 * Centralizing this behavior removes repeated defensive try/catch blocks from
 * gesture handlers and keeps error handling consistent.
 */

type PointerCaptureTarget = {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
  hasPointerCapture?: (pointerId: number) => boolean;
};

export function trySetPointerCapture(target: PointerCaptureTarget | null, pointerId: number): boolean {
  if (!target?.setPointerCapture) return false;
  try {
    target.setPointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}

export function tryReleasePointerCapture(target: PointerCaptureTarget | null, pointerId: number): boolean {
  if (!target?.releasePointerCapture) return false;
  // Skip release call when target can confirm it does not currently own capture.
  if (target.hasPointerCapture && !target.hasPointerCapture(pointerId)) return false;
  try {
    target.releasePointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}

export function tryReleasePointerCaptures(
  target: PointerCaptureTarget | null,
  pointerIds: Iterable<number>
): number {
  let releasedCount = 0;
  for (const pointerId of pointerIds) {
    if (tryReleasePointerCapture(target, pointerId)) releasedCount += 1;
  }
  return releasedCount;
}

