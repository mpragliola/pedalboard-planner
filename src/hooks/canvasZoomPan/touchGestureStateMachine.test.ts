import { describe, expect, it } from "vitest";
import {
  IDLE_TOUCH_GESTURE_STATE,
  resolvePinchMove,
  startPinchGesture,
} from "./touchGestureStateMachine";

describe("touchGestureStateMachine", () => {
  it("captures initial pinch geometry when gesture starts", () => {
    const state = startPinchGesture({ clientX: 0, clientY: 0 }, { clientX: 10, clientY: 0 }, 1.5);
    expect(state.tag).toBe("pinching");
    expect(state.initialDistance).toBe(10);
    expect(state.initialZoom).toBe(1.5);
    expect(state.pivotX).toBe(5);
    expect(state.pivotY).toBe(0);
    expect(state.previousCenterX).toBe(5);
    expect(state.previousCenterY).toBe(0);
  });

  it("ignores move transitions when state is idle", () => {
    const decision = resolvePinchMove(
      IDLE_TOUCH_GESTURE_STATE,
      { clientX: 0, clientY: 0 },
      { clientX: 10, clientY: 0 },
      0.95
    );
    expect(decision.tag).toBe("ignore");
    expect(decision.nextState).toEqual(IDLE_TOUCH_GESTURE_STATE);
  });

  it("emits zoom when scale exits pinch threshold window", () => {
    const state = startPinchGesture({ clientX: 0, clientY: 0 }, { clientX: 10, clientY: 0 }, 2);
    const decision = resolvePinchMove(state, { clientX: 0, clientY: 0 }, { clientX: 20, clientY: 0 }, 0.95);
    expect(decision.tag).toBe("zoom");
    if (decision.tag !== "zoom") return;
    expect(decision.scale).toBe(2);
    expect(decision.pivotX).toBe(5);
    expect(decision.pivotY).toBe(0);
    expect(decision.nextState).toEqual(state);
  });

  it("emits pan and advances previous center for incremental deltas", () => {
    const state = startPinchGesture({ clientX: 0, clientY: 0 }, { clientX: 10, clientY: 10 }, 1);
    const decision = resolvePinchMove(state, { clientX: 1, clientY: 2 }, { clientX: 11, clientY: 12 }, 0.95);
    expect(decision.tag).toBe("pan");
    if (decision.tag !== "pan") return;
    expect(decision.deltaX).toBe(1);
    expect(decision.deltaY).toBe(2);
    expect(decision.nextState.previousCenterX).toBe(6);
    expect(decision.nextState.previousCenterY).toBe(7);
  });
});

