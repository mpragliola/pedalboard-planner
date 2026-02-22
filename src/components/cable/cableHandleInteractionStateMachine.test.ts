import { describe, expect, it } from "vitest";
import {
  IDLE_CABLE_HANDLE_INTERACTION_STATE,
  consumeCableHandlePending,
  isCableHandlePressing,
  startCableHandleInteraction,
} from "./cableHandleInteractionStateMachine";

describe("cableHandleInteractionStateMachine", () => {
  it("starts mid-handle interaction with press feedback enabled", () => {
    const state = startCableHandleInteraction({
      cableId: "c1",
      handleIndex: 2,
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      isExtremity: false,
    });

    expect(state.tag).toBe("awaiting-drag");
    if (state.tag !== "awaiting-drag") return;
    expect(state.showPress).toBe(true);
    expect(state.pendingAvailable).toBe(true);
  });

  it("starts extremity interaction without press feedback", () => {
    const state = startCableHandleInteraction({
      cableId: "c1",
      handleIndex: 0,
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      isExtremity: true,
    });

    expect(state.tag).toBe("awaiting-drag");
    if (state.tag !== "awaiting-drag") return;
    expect(state.showPress).toBe(false);
    expect(state.pendingAvailable).toBe(true);
  });

  it("consumes pending payload once for matching cable id", () => {
    const initial = startCableHandleInteraction({
      cableId: "c1",
      handleIndex: 1,
      points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      isExtremity: false,
    });
    const first = consumeCableHandlePending(initial, "c1");
    expect(first.payload).toEqual({ handleIndex: 1, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] });
    const second = consumeCableHandlePending(first.nextState, "c1");
    expect(second.payload).toBeNull();
  });

  it("does not consume payload for non-matching cable id", () => {
    const initial = startCableHandleInteraction({
      cableId: "c1",
      handleIndex: 1,
      points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      isExtremity: false,
    });
    const result = consumeCableHandlePending(initial, "other");
    expect(result.payload).toBeNull();
    expect(result.nextState).toEqual(initial);
  });

  it("returns null payload in idle state", () => {
    const result = consumeCableHandlePending(IDLE_CABLE_HANDLE_INTERACTION_STATE, "c1");
    expect(result.payload).toBeNull();
    expect(result.nextState).toEqual(IDLE_CABLE_HANDLE_INTERACTION_STATE);
  });

  it("computes pressed-handle predicate from explicit state", () => {
    const state = startCableHandleInteraction({
      cableId: "c5",
      handleIndex: 4,
      points: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      isExtremity: false,
    });

    expect(isCableHandlePressing(state, "c5", 4)).toBe(true);
    expect(isCableHandlePressing(state, "c5", 3)).toBe(false);
    expect(isCableHandlePressing(state, "other", 4)).toBe(false);
    expect(isCableHandlePressing(IDLE_CABLE_HANDLE_INTERACTION_STATE, "c5", 4)).toBe(false);
  });
});

