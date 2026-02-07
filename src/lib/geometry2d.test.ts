import { describe, expect, it } from "vitest";
import { getDirectionalOffset, rectsOverlap } from "./geometry2d";

describe("geometry2d helpers", () => {
  it("detects overlapping rects", () => {
    expect(
      rectsOverlap(
        { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        { minX: 5, minY: 4, maxX: 12, maxY: 15 }
      )
    ).toBe(true);
  });

  it("does not treat edge-touching rects as overlap", () => {
    expect(
      rectsOverlap(
        { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        { minX: 10, minY: 0, maxX: 20, maxY: 10 }
      )
    ).toBe(false);
  });

  it("does not overlap when rects are separated", () => {
    expect(
      rectsOverlap(
        { minX: -10, minY: -10, maxX: -5, maxY: -5 },
        { minX: 0, minY: 0, maxX: 5, maxY: 5 }
      )
    ).toBe(false);
  });

  it("returns a normalized directional offset scaled by distanceFactor", () => {
    const out = getDirectionalOffset(3, 4, 10);
    expect(out.offsetX).toBeCloseTo(6, 8);
    expect(out.offsetY).toBeCloseTo(8, 8);
  });

  it("returns zero offset for zero-length direction", () => {
    const out = getDirectionalOffset(0, 0, 50);
    expect(out).toEqual({ offsetX: 0, offsetY: 0 });
  });
});
