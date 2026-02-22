import type { Offset } from "../../lib/vector";

export type PointerPanState =
  | { tag: "idle" }
  | {
      tag: "panning";
      pointerId: number;
      mouseX: number;
      mouseY: number;
      panX: number;
      panY: number;
    };

/** Shared idle singleton for explicit initialization/reset. */
export const IDLE_POINTER_PAN_STATE: PointerPanState = { tag: "idle" };

export interface StartPointerPanInput {
  pointerId: number;
  mouseX: number;
  mouseY: number;
  panX: number;
  panY: number;
}

/** Transition helper: `idle` -> `panning`. */
export function startPointerPan(input: StartPointerPanInput): PointerPanState {
  return {
    tag: "panning",
    pointerId: input.pointerId,
    mouseX: input.mouseX,
    mouseY: input.mouseY,
    panX: input.panX,
    panY: input.panY,
  };
}

/**
 * Computes next pan offset for move events owned by active panning pointer.
 * Returns null when state is idle or pointer id does not match current owner.
 */
export function resolvePointerPanMove(
  state: PointerPanState,
  pointerId: number,
  clientX: number,
  clientY: number
): Offset | null {
  if (state.tag !== "panning" || state.pointerId !== pointerId) return null;
  return {
    x: state.panX + (clientX - state.mouseX),
    y: state.panY + (clientY - state.mouseY),
  };
}

/** Whether pointer-up should end current pan session. */
export function shouldEndPointerPan(state: PointerPanState, pointerId: number): boolean {
  return state.tag === "panning" && state.pointerId === pointerId;
}

