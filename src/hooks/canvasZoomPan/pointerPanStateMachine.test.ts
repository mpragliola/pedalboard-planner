import { describe, expect, it } from "vitest";
import {
  IDLE_POINTER_PAN_STATE,
  resolvePointerPanMove,
  shouldEndPointerPan,
  startPointerPan,
} from "./pointerPanStateMachine";

describe("pointerPanStateMachine", () => {
  it("creates panning state with start pointer/pan snapshot", () => {
    const state = startPointerPan({
      pointerId: 3,
      mouseX: 100,
      mouseY: 200,
      panX: 10,
      panY: 20,
    });
    expect(state).toEqual({
      tag: "panning",
      pointerId: 3,
      mouseX: 100,
      mouseY: 200,
      panX: 10,
      panY: 20,
    });
  });

  it("computes pan deltas for active panning pointer", () => {
    const state = startPointerPan({
      pointerId: 1,
      mouseX: 50,
      mouseY: 50,
      panX: 5,
      panY: -5,
    });
    expect(resolvePointerPanMove(state, 1, 70, 80)).toEqual({ x: 25, y: 25 });
  });

  it("ignores move when pointer id does not own the pan", () => {
    const state = startPointerPan({
      pointerId: 1,
      mouseX: 50,
      mouseY: 50,
      panX: 5,
      panY: -5,
    });
    expect(resolvePointerPanMove(state, 2, 70, 80)).toBeNull();
  });

  it("ignores move while idle", () => {
    expect(resolvePointerPanMove(IDLE_POINTER_PAN_STATE, 1, 70, 80)).toBeNull();
  });

  it("ends pan only for active pointer", () => {
    const state = startPointerPan({
      pointerId: 7,
      mouseX: 0,
      mouseY: 0,
      panX: 0,
      panY: 0,
    });
    expect(shouldEndPointerPan(state, 7)).toBe(true);
    expect(shouldEndPointerPan(state, 8)).toBe(false);
    expect(shouldEndPointerPan(IDLE_POINTER_PAN_STATE, 7)).toBe(false);
  });
});

