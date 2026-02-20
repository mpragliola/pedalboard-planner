import { describe, expect, it } from "vitest";
import {
  advanceCablePhysics,
  createCablePhysicsState,
  maxPointDelta,
} from "./cablePhysics";

describe("cablePhysics", () => {
  it("keeps endpoints pinned to anchors", () => {
    const a = { x: 10, y: 20 };
    const b = { x: 150, y: 60 };
    let state = createCablePhysicsState();
    state = advanceCablePhysics(state, a, b, 0);
    state = advanceCablePhysics(state, a, b, 16);
    state = advanceCablePhysics(state, a, b, 32);

    expect(state.particles[0]).toMatchObject({ x: a.x, y: a.y, prevX: a.x, prevY: a.y });
    expect(state.particles[state.particles.length - 1]).toMatchObject({
      x: b.x,
      y: b.y,
      prevX: b.x,
      prevY: b.y,
    });
  });

  it("does not mutate the previous state input", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 120, y: 0 };
    const state1 = advanceCablePhysics(createCablePhysicsState(), a, b, 0);
    const snapshot = JSON.parse(JSON.stringify(state1));
    advanceCablePhysics(state1, a, b, 16);
    expect(state1).toEqual(snapshot);
  });

  it("computes max point displacement and handles mismatched lengths", () => {
    expect(maxPointDelta([], [{ x: 0, y: 0 }])).toBe(Infinity);
    expect(
      maxPointDelta(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        [
          { x: 3, y: 4 },
          { x: 1, y: 1 },
        ]
      )
    ).toBeCloseTo(5, 8);
  });
});
