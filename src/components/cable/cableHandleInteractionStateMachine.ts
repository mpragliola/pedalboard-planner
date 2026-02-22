import type { Point } from "../../lib/vector";

export interface CableHandlePendingPayload {
  points: Point[];
  handleIndex: number;
}

export type CableHandleInteractionState =
  | { tag: "idle" }
  | {
      tag: "awaiting-drag";
      cableId: string;
      handleIndex: number;
      points: Point[];
      /** Whether UI should render the pressed-handle visual state. */
      showPress: boolean;
      /** One-shot pending payload flag consumed by `useDragState.getPendingPayload`. */
      pendingAvailable: boolean;
    };

export interface StartCableHandleInteractionInput {
  cableId: string;
  handleIndex: number;
  points: Point[];
  isExtremity: boolean;
}

/** Shared idle singleton for clear/reset operations. */
export const IDLE_CABLE_HANDLE_INTERACTION_STATE: CableHandleInteractionState = { tag: "idle" };

/**
 * Starts handle interaction in a single explicit state token.
 *
 * - Mid handles: show press feedback and arm long-press removal.
 * - Extremity handles: no press feedback, but drag payload is still armed.
 */
export function startCableHandleInteraction(
  input: StartCableHandleInteractionInput
): CableHandleInteractionState {
  return {
    tag: "awaiting-drag",
    cableId: input.cableId,
    handleIndex: input.handleIndex,
    points: input.points,
    showPress: !input.isExtremity,
    pendingAvailable: true,
  };
}

/**
 * Consumes pending drag payload once, keeping interaction state otherwise intact.
 *
 * This mirrors previous behavior where pending index was one-shot:
 * `useDragState.handleDragStart` should read payload only at pointer-down time.
 */
export function consumeCableHandlePending(
  state: CableHandleInteractionState,
  cableId: string
): { nextState: CableHandleInteractionState; payload: CableHandlePendingPayload | null } {
  if (state.tag !== "awaiting-drag") {
    return { nextState: state, payload: null };
  }
  if (state.cableId !== cableId || !state.pendingAvailable) {
    return { nextState: state, payload: null };
  }
  return {
    nextState: { ...state, pendingAvailable: false },
    payload: { points: state.points, handleIndex: state.handleIndex },
  };
}

/** Whether given cable handle should render pressed style in current state. */
export function isCableHandlePressing(
  state: CableHandleInteractionState,
  cableId: string,
  handleIndex: number
): boolean {
  return (
    state.tag === "awaiting-drag" &&
    state.showPress &&
    state.cableId === cableId &&
    state.handleIndex === handleIndex
  );
}

