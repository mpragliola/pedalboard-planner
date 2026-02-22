import { describe, expect, it, vi } from "vitest";
import {
  tryReleasePointerCapture,
  tryReleasePointerCaptures,
  trySetPointerCapture,
} from "./pointerCapture";

describe("pointerCapture", () => {
  describe("trySetPointerCapture", () => {
    it("returns false when target is missing", () => {
      expect(trySetPointerCapture(null, 1)).toBe(false);
    });

    it("returns true when setPointerCapture succeeds", () => {
      const target = { setPointerCapture: vi.fn() };
      expect(trySetPointerCapture(target, 3)).toBe(true);
      expect(target.setPointerCapture).toHaveBeenCalledWith(3);
    });

    it("returns false when setPointerCapture throws", () => {
      const target = {
        setPointerCapture: vi.fn(() => {
          throw new Error("capture failed");
        }),
      };
      expect(trySetPointerCapture(target, 2)).toBe(false);
    });
  });

  describe("tryReleasePointerCapture", () => {
    it("returns false when target is missing", () => {
      expect(tryReleasePointerCapture(null, 1)).toBe(false);
    });

    it("returns false when hasPointerCapture says target does not own capture", () => {
      const target = {
        releasePointerCapture: vi.fn(),
        hasPointerCapture: vi.fn(() => false),
      };
      expect(tryReleasePointerCapture(target, 8)).toBe(false);
      expect(target.releasePointerCapture).not.toHaveBeenCalled();
    });

    it("returns true when releasePointerCapture succeeds", () => {
      const target = {
        releasePointerCapture: vi.fn(),
        hasPointerCapture: vi.fn(() => true),
      };
      expect(tryReleasePointerCapture(target, 8)).toBe(true);
      expect(target.releasePointerCapture).toHaveBeenCalledWith(8);
    });

    it("returns false when releasePointerCapture throws", () => {
      const target = {
        releasePointerCapture: vi.fn(() => {
          throw new Error("release failed");
        }),
      };
      expect(tryReleasePointerCapture(target, 8)).toBe(false);
    });
  });

  describe("tryReleasePointerCaptures", () => {
    it("releases each provided pointer id and returns release count", () => {
      const target = {
        releasePointerCapture: vi.fn(),
        hasPointerCapture: vi.fn((pointerId: number) => pointerId !== 2),
      };
      const released = tryReleasePointerCaptures(target, [1, 2, 3]);
      expect(released).toBe(2);
      expect(target.releasePointerCapture).toHaveBeenCalledTimes(2);
      expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
      expect(target.releasePointerCapture).toHaveBeenCalledWith(3);
    });
  });
});

