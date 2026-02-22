/**
 * Local pointer gesture state machine for CableLayerOverlay.
 *
 * This replaces the previous split ownership:
 * - `activePointersRef` (set bookkeeping)
 * - `isPinchingRef` (derived-but-stored boolean)
 *
 * with a single discriminated union that makes legal combinations explicit.
 */
import {
  addPinchPointer,
  createInitialPinchLifecycleState,
  LATCHED_UNTIL_RELEASE_PINCH_POLICY,
  removePinchPointer,
  type PinchLifecycleState,
} from "../../lib/pinchLifecycle";

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
  const initial = createInitialPinchLifecycleState();
  return { tag: "ready", activePointerIds: initial.activePointerIds };
}

function toPinchLifecycleState(state: CableLayerGestureState): PinchLifecycleState {
  return {
    activePointerIds: state.activePointerIds,
    isPinching: state.tag === "pinching",
  };
}

function fromPinchLifecycleState(state: PinchLifecycleState): CableLayerGestureState {
  return {
    tag: state.isPinching ? "pinching" : "ready",
    activePointerIds: state.activePointerIds,
  };
}

/**
 * Registers pointer-down and transitions into pinch mode once two or more
 * pointers are active.
 */
export function applyCableLayerPointerDown(
  state: CableLayerGestureState,
  pointerId: number
): CableLayerGestureState {
  const transition = addPinchPointer(
    toPinchLifecycleState(state),
    pointerId,
    // Overlay pinch suppression stays latched until all pointers are released.
    LATCHED_UNTIL_RELEASE_PINCH_POLICY
  );
  return fromPinchLifecycleState(transition.nextState);
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
  const transition = removePinchPointer(
    toPinchLifecycleState(state),
    pointerId,
    LATCHED_UNTIL_RELEASE_PINCH_POLICY
  );
  const nextState = fromPinchLifecycleState(transition.nextState);

  if (state.tag === "pinching") {
    if (transition.pinchEnded) {
      return {
        nextState,
        phase: "pinch-ended",
      };
    }
    if (transition.nextState.isPinching) {
      return {
        nextState,
        phase: "still-pinching",
      };
    }
  }

  return {
    nextState,
    phase: "ready",
  };
}
