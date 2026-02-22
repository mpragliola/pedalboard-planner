import { describe, expect, it } from "vitest";
import { isDoubleTapWithinThreshold } from "./tapGesture";

describe("isDoubleTapWithinThreshold", () => {
  const threshold = { windowMs: 320, maxDistancePx: 28 };

  it("returns false when there is no previous tap", () => {
    expect(
      isDoubleTapWithinThreshold(null, { time: 1000, x: 10, y: 20 }, threshold)
    ).toBe(false);
  });

  it("returns true when time and distance are both within threshold", () => {
    expect(
      isDoubleTapWithinThreshold(
        { time: 1000, x: 10, y: 20 },
        { time: 1200, x: 20, y: 30 },
        threshold
      )
    ).toBe(true);
  });

  it("returns false when tap window is exceeded", () => {
    expect(
      isDoubleTapWithinThreshold(
        { time: 1000, x: 10, y: 20 },
        { time: 1321, x: 10, y: 20 },
        threshold
      )
    ).toBe(false);
  });

  it("returns false when movement exceeds distance threshold", () => {
    expect(
      isDoubleTapWithinThreshold(
        { time: 1000, x: 10, y: 20 },
        { time: 1100, x: 100, y: 100 },
        threshold
      )
    ).toBe(false);
  });
});

