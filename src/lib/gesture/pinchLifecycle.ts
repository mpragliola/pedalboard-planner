/**
 * Shared pinch lifecycle state used by multiple gesture handlers.
 *
 * Why this exists:
 * - Cable overlay and touch zoom both track "active pointer ids + pinching".
 * - They need slightly different continuation rules after pinch starts.
 * - This module centralizes transition math while allowing policy tuning.
 */

export interface PinchLifecycleState {
  /** Currently active pointer/touch identifiers participating in this lifecycle. */
  activePointerIds: Set<number>;
  /** True when pinch suppression/ownership is currently active. */
  isPinching: boolean;
}

export interface PinchLifecyclePolicy {
  /**
   * Minimum active pointers required to ENTER pinch mode from non-pinching.
   * Typical value is 2.
   */
  startMinPointers: number;
  /**
   * Minimum active pointers required to STAY in pinch mode once active.
   * - Touch zoom commonly uses 2 (drop to 1 ends pinch immediately).
   * - Cable overlay uses 1 (keep suppression latched until full release).
   */
  continueMinPointers: number;
}

export interface PinchLifecycleTransition {
  nextState: PinchLifecycleState;
  pinchStarted: boolean;
  pinchEnded: boolean;
}

/** Standard touch policy: pinch is active only while 2+ touches remain. */
export const STRICT_TWO_POINTER_PINCH_POLICY: PinchLifecyclePolicy = {
  startMinPointers: 2,
  continueMinPointers: 2,
};

/**
 * Latched policy: pinch starts at 2+, then remains active while at least one
 * pointer remains (useful for suppressing accidental draw commits after pinch).
 */
export const LATCHED_UNTIL_RELEASE_PINCH_POLICY: PinchLifecyclePolicy = {
  startMinPointers: 2,
  continueMinPointers: 1,
};

export function createInitialPinchLifecycleState(): PinchLifecycleState {
  return {
    activePointerIds: new Set(),
    isPinching: false,
  };
}


/**
 * Normalize policy values to valid integers with sensible defaults.
 * - startMin must be at least 2 to allow pinching to start.
 * - continueMin must be at least 1 to allow pinch to continue after starting.
 */
function normalizePolicy(policy: PinchLifecyclePolicy): { startMin: number; continueMin: number } {
  return {
    startMin: Math.max(2, Math.floor(policy.startMinPointers)),
    continueMin: Math.max(1, Math.floor(policy.continueMinPointers)),
  };
}

/**
 * Core transition: compute pinch lifecycle from a full set of active ids.
 *
 * This function is deterministic/pure:
 * - callers own state storage (refs/useState)
 * - all transition flags are derived from previous + next active ids
 */
export function syncPinchLifecycle(
  state: PinchLifecycleState,
  activePointerIds: Iterable<number>,
  policy: PinchLifecyclePolicy = STRICT_TWO_POINTER_PINCH_POLICY
): PinchLifecycleTransition {
  const { startMin, continueMin } = normalizePolicy(policy);
  const nextActivePointerIds = new Set(activePointerIds);
  const wasPinching = state.isPinching;
  const nextCount = nextActivePointerIds.size;
  const isPinching = wasPinching ? nextCount >= continueMin : nextCount >= startMin;

  return {
    nextState: {
      activePointerIds: nextActivePointerIds,
      isPinching,
    },
    pinchStarted: !wasPinching && isPinching,
    pinchEnded: wasPinching && !isPinching,
  };
}

/** Convenience transition for pointer-down style handlers. */
export function addPinchPointer(
  state: PinchLifecycleState,
  pointerId: number,
  policy: PinchLifecyclePolicy = STRICT_TWO_POINTER_PINCH_POLICY
): PinchLifecycleTransition {
  const nextActivePointerIds = new Set(state.activePointerIds);
  nextActivePointerIds.add(pointerId);
  return syncPinchLifecycle(state, nextActivePointerIds, policy);
}

/** Convenience transition for pointer-up style handlers. */
export function removePinchPointer(
  state: PinchLifecycleState,
  pointerId: number,
  policy: PinchLifecyclePolicy = STRICT_TWO_POINTER_PINCH_POLICY
): PinchLifecycleTransition {
  const nextActivePointerIds = new Set(state.activePointerIds);
  nextActivePointerIds.delete(pointerId);
  return syncPinchLifecycle(state, nextActivePointerIds, policy);
}
