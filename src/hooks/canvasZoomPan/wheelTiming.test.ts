import { describe, expect, it } from "vitest";
import { getWheelApplyDelay, normalizeWheelDelta } from "./wheelTiming";

describe("wheelTiming", () => {
  describe("getWheelApplyDelay", () => {
    it("returns zero when no wheel apply has happened yet", () => {
      // First wheel event in a burst should never be delayed.
      expect(
        getWheelApplyDelay({
          hasApplied: false,
          lastApplyAt: 100,
          now: 120,
          throttleMs: 40,
        })
      ).toBe(0);
    });

    it("returns zero when throttle window has elapsed", () => {
      // Once enough time passes, apply can happen immediately again.
      expect(
        getWheelApplyDelay({
          hasApplied: true,
          lastApplyAt: 100,
          now: 160,
          throttleMs: 40,
        })
      ).toBe(0);
    });

    it("returns remaining delay within throttle window", () => {
      // Inside throttle window, helper should return the exact remaining wait.
      expect(
        getWheelApplyDelay({
          hasApplied: true,
          lastApplyAt: 100,
          now: 125,
          throttleMs: 40,
        })
      ).toBe(15);
    });
  });

  describe("normalizeWheelDelta", () => {
    it("converts line-mode deltas to pixel-ish scale", () => {
      // deltaMode 1 = lines; scaling keeps sensitivity comparable to pixel mode.
      expect(normalizeWheelDelta(1, 2)).toBe(-64);
    });

    it("keeps pixel-mode deltas unchanged except sign normalization", () => {
      // deltaMode 0 = pixels; only normalize direction.
      expect(normalizeWheelDelta(0, 2)).toBe(-2);
    });
  });
});
