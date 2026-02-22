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

/**
 * Stateful pointer-capture coordinator for one interaction surface.
 *
 * Responsibilities:
 * 1) remember which target currently owns capture for each pointer id
 * 2) release previous owner before re-capturing the same pointer id elsewhere
 * 3) provide one-shot cleanup (`releaseAll`) on gesture abort/unmount
 */
export interface PointerCaptureManager {
  capture: (target: PointerCaptureTarget | null, pointerId: number) => boolean;
  release: (pointerId: number, fallbackTarget?: PointerCaptureTarget | null) => boolean;
  releaseMany: (pointerIds: Iterable<number>, fallbackTarget?: PointerCaptureTarget | null) => number;
  releaseAll: () => number;
}

export function createPointerCaptureManager(): PointerCaptureManager {
  // Tracks current capture owner per pointer id.
  const ownersByPointerId = new Map<number, PointerCaptureTarget>();

  const release = (pointerId: number, fallbackTarget?: PointerCaptureTarget | null): boolean => {
    const owner = ownersByPointerId.get(pointerId) ?? fallbackTarget ?? null;
    const didRelease = tryReleasePointerCapture(owner, pointerId);
    // Always clear local bookkeeping so stale ownership does not leak across
    // canceled/lost pointers (browser state is authoritative).
    ownersByPointerId.delete(pointerId);
    return didRelease;
  };

  const capture = (target: PointerCaptureTarget | null, pointerId: number): boolean => {
    if (!target) return false;

    const previousOwner = ownersByPointerId.get(pointerId);
    if (previousOwner && previousOwner !== target) {
      // Move ownership from previous target to next target deterministically.
      tryReleasePointerCapture(previousOwner, pointerId);
      ownersByPointerId.delete(pointerId);
    }

    const didCapture = trySetPointerCapture(target, pointerId);
    if (didCapture) ownersByPointerId.set(pointerId, target);
    return didCapture;
  };

  const releaseMany = (pointerIds: Iterable<number>, fallbackTarget?: PointerCaptureTarget | null): number => {
    let releasedCount = 0;
    for (const pointerId of pointerIds) {
      if (release(pointerId, fallbackTarget)) releasedCount += 1;
    }
    return releasedCount;
  };

  const releaseAll = (): number => {
    let releasedCount = 0;
    for (const [pointerId, owner] of ownersByPointerId) {
      if (tryReleasePointerCapture(owner, pointerId)) releasedCount += 1;
      ownersByPointerId.delete(pointerId);
    }
    return releasedCount;
  };

  return {
    capture,
    release,
    releaseMany,
    releaseAll,
  };
}
