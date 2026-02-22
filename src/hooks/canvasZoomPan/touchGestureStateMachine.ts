import { center, dist } from "./utils";

type ClientPoint = { clientX: number; clientY: number };

export interface PinchingGestureState {
  tag: "pinching";
  initialDistance: number;
  initialZoom: number;
  pivotX: number;
  pivotY: number;
  previousCenterX: number;
  previousCenterY: number;
}

export type TouchGestureState = { tag: "idle" } | PinchingGestureState;

export type TouchGestureMoveDecision =
  | {
      tag: "ignore";
      nextState: TouchGestureState;
    }
  | {
      tag: "zoom";
      nextState: PinchingGestureState;
      scale: number;
      pivotX: number;
      pivotY: number;
    }
  | {
      tag: "pan";
      nextState: PinchingGestureState;
      deltaX: number;
      deltaY: number;
    };

/** Shared idle singleton for explicit gesture-state initialization/reset. */
export const IDLE_TOUCH_GESTURE_STATE: TouchGestureState = { tag: "idle" };

/**
 * Transition helper: `idle` -> `pinching`.
 *
 * The pivot is captured once at pinch start and reused for zoom operations so
 * zoom feels anchored to where the gesture began.
 */
export function startPinchGesture(
  firstTouch: ClientPoint,
  secondTouch: ClientPoint,
  initialZoom: number
): PinchingGestureState {
  const pinchCenter = center(firstTouch, secondTouch);
  return {
    tag: "pinching",
    initialDistance: dist(firstTouch, secondTouch),
    initialZoom,
    pivotX: pinchCenter.x,
    pivotY: pinchCenter.y,
    previousCenterX: pinchCenter.x,
    previousCenterY: pinchCenter.y,
  };
}

/**
 * Transition helper for move events while two touches are active.
 *
 * Decision model:
 * 1. If not in `pinching`, ignore.
 * 2. If scale moved outside threshold window, emit zoom.
 * 3. Otherwise emit pan and advance previous center for incremental deltas.
 */
export function resolvePinchMove(
  state: TouchGestureState,
  firstTouch: ClientPoint,
  secondTouch: ClientPoint,
  threshold: number
): TouchGestureMoveDecision {
  if (state.tag !== "pinching") {
    return { tag: "ignore", nextState: state };
  }

  const distance = dist(firstTouch, secondTouch);
  const scale = distance / state.initialDistance;
  const pinchCenter = center(firstTouch, secondTouch);

  if (scale < threshold || scale > 1 / threshold) {
    return {
      tag: "zoom",
      nextState: state,
      scale,
      pivotX: state.pivotX,
      pivotY: state.pivotY,
    };
  }

  const deltaX = pinchCenter.x - state.previousCenterX;
  const deltaY = pinchCenter.y - state.previousCenterY;
  return {
    tag: "pan",
    nextState: {
      ...state,
      previousCenterX: pinchCenter.x,
      previousCenterY: pinchCenter.y,
    },
    deltaX,
    deltaY,
  };
}

