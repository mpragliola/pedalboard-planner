/**
 * Local pointer gesture state machine for CableLayerOverlay.
 *
 * This replaces the previous split ownership:
 * - `activePointersRef` (set bookkeeping)
 * - `isPinchingRef` (derived-but-stored boolean)
 *
 * with a single discriminated union that makes legal combinations explicit.
 */

export type CableLayerGestureState =
  | {
      /** Normal draw-capable state (may still have active pointers). */
      tag: "ready";
      activePointerIds: Set<number>;
    }
  | {
      /** Pinch suppression state while multi-touch interaction is active. */
      tag: "pinching";
      activePointerIds: Set<number>;
    };

export type PointerUpPhase = "ready" | "still-pinching" | "pinch-ended";

export interface PointerUpTransitionResult {
  nextState: CableLayerGestureState;
  phase: PointerUpPhase;
}

/** Initializes machine state with no active pointers and drawing enabled. */
export function createInitialCableLayerGestureState(): CableLayerGestureState {
  return { tag: "ready", activePointerIds: new Set() };
}

/**
 * Registers pointer-down and transitions into pinch mode once two or more
 * pointers are active.
 */
export function applyCableLayerPointerDown(
  state: CableLayerGestureState,
  pointerId: number
): CableLayerGestureState {
  const nextActivePointerIds = new Set(state.activePointerIds);
  nextActivePointerIds.add(pointerId);
  if (nextActivePointerIds.size >= 2) {
    return { tag: "pinching", activePointerIds: nextActivePointerIds };
  }
  return {
    tag: state.tag,
    activePointerIds: nextActivePointerIds,
  };
}

/**
 * Registers pointer-up and emits a phase token used by overlay preflight logic:
 * - `ready`: normal pointer-up processing may continue.
 * - `still-pinching`: suppress processing because pinch remains active.
 * - `pinch-ended`: suppress processing for the final release that ended pinch.
 */
export function applyCableLayerPointerUp(
  state: CableLayerGestureState,
  pointerId: number
): PointerUpTransitionResult {
  const nextActivePointerIds = new Set(state.activePointerIds);
  nextActivePointerIds.delete(pointerId);

  if (state.tag === "pinching") {
    if (nextActivePointerIds.size === 0) {
      return {
        nextState: { tag: "ready", activePointerIds: nextActivePointerIds },
        phase: "pinch-ended",
      };
    }
    return {
      nextState: { tag: "pinching", activePointerIds: nextActivePointerIds },
      phase: "still-pinching",
    };
  }

  return {
    nextState: { tag: "ready", activePointerIds: nextActivePointerIds },
    phase: "ready",
  };
}

