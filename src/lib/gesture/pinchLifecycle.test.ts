import { describe, expect, it } from "vitest";
import {
  addPinchPointer,
  createInitialPinchLifecycleState,
  LATCHED_UNTIL_RELEASE_PINCH_POLICY,
  removePinchPointer,
  STRICT_TWO_POINTER_PINCH_POLICY,
  syncPinchLifecycle,
} from "./pinchLifecycle";

describe("pinchLifecycle", () => {
  it("starts pinch when active pointers reach threshold", () => {
    const state = createInitialPinchLifecycleState();
    const transition = addPinchPointer(
      addPinchPointer(state, 1, STRICT_TWO_POINTER_PINCH_POLICY).nextState,
      2,
      STRICT_TWO_POINTER_PINCH_POLICY
    );
    expect(transition.pinchStarted).toBe(true);
    expect(transition.nextState.isPinching).toBe(true);
    expect(transition.nextState.activePointerIds.size).toBe(2);
  });

  it("ends pinch immediately when strict two-pointer policy drops below two", () => {
    const pinching = syncPinchLifecycle(
      createInitialPinchLifecycleState(),
      [1, 2],
      STRICT_TWO_POINTER_PINCH_POLICY
    ).nextState;
    const transition = removePinchPointer(pinching, 2, STRICT_TWO_POINTER_PINCH_POLICY);
    expect(transition.pinchEnded).toBe(true);
    expect(transition.nextState.isPinching).toBe(false);
    expect(transition.nextState.activePointerIds.size).toBe(1);
  });

  it("keeps pinch latched while one pointer remains under latched policy", () => {
    const pinching = syncPinchLifecycle(
      createInitialPinchLifecycleState(),
      [1, 2],
      LATCHED_UNTIL_RELEASE_PINCH_POLICY
    ).nextState;
    const afterFirstRelease = removePinchPointer(pinching, 2, LATCHED_UNTIL_RELEASE_PINCH_POLICY);
    expect(afterFirstRelease.pinchEnded).toBe(false);
    expect(afterFirstRelease.nextState.isPinching).toBe(true);
    const afterFinalRelease = removePinchPointer(
      afterFirstRelease.nextState,
      1,
      LATCHED_UNTIL_RELEASE_PINCH_POLICY
    );
    expect(afterFinalRelease.pinchEnded).toBe(true);
    expect(afterFinalRelease.nextState.isPinching).toBe(false);
  });
});
