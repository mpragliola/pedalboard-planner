import { describe, expect, it } from "vitest";
import {
  applyCableLayerPointerDown,
  applyCableLayerPointerUp,
  createInitialCableLayerGestureState,
} from "./cableLayerGestureStateMachine";

describe("cableLayerGestureStateMachine", () => {
  it("starts in ready state with no active pointers", () => {
    const state = createInitialCableLayerGestureState();
    expect(state.tag).toBe("ready");
    expect(state.activePointerIds.size).toBe(0);
  });

  it("transitions to pinching when second pointer is registered", () => {
    const stateAfterFirstDown = applyCableLayerPointerDown(createInitialCableLayerGestureState(), 1);
    expect(stateAfterFirstDown.tag).toBe("ready");
    expect(stateAfterFirstDown.activePointerIds.size).toBe(1);

    const stateAfterSecondDown = applyCableLayerPointerDown(stateAfterFirstDown, 2);
    expect(stateAfterSecondDown.tag).toBe("pinching");
    expect(stateAfterSecondDown.activePointerIds.size).toBe(2);
  });

  it("keeps pinch active while at least one pointer remains", () => {
    const pinchState = applyCableLayerPointerDown(
      applyCableLayerPointerDown(createInitialCableLayerGestureState(), 1),
      2
    );
    const transition = applyCableLayerPointerUp(pinchState, 2);

    expect(transition.phase).toBe("still-pinching");
    expect(transition.nextState.tag).toBe("pinching");
    expect(transition.nextState.activePointerIds.size).toBe(1);
  });

  it("emits pinch-ended when final pointer is released", () => {
    const pinchState = applyCableLayerPointerDown(
      applyCableLayerPointerDown(createInitialCableLayerGestureState(), 1),
      2
    );
    const afterFirstRelease = applyCableLayerPointerUp(pinchState, 2);
    const afterFinalRelease = applyCableLayerPointerUp(afterFirstRelease.nextState, 1);

    expect(afterFinalRelease.phase).toBe("pinch-ended");
    expect(afterFinalRelease.nextState.tag).toBe("ready");
    expect(afterFinalRelease.nextState.activePointerIds.size).toBe(0);
  });

  it("returns ready phase for non-pinch pointer-up", () => {
    const readyState = applyCableLayerPointerDown(createInitialCableLayerGestureState(), 7);
    const transition = applyCableLayerPointerUp(readyState, 7);

    expect(transition.phase).toBe("ready");
    expect(transition.nextState.tag).toBe("ready");
    expect(transition.nextState.activePointerIds.size).toBe(0);
  });
});

