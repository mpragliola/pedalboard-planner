import { describe, expect, it } from "vitest";
import {
  derivePinchAfterPointerUp,
  isPointerUpPrimary,
  resolveCableLayerPointerUpPreflight,
} from "./cableLayerPointerUp";

describe("cableLayerPointerUp", () => {
  describe("derivePinchAfterPointerUp", () => {
    it("keeps pinch active when pointers remain after release", () => {
      expect(
        derivePinchAfterPointerUp({
          wasPinching: true,
          remainingActivePointers: 1,
        })
      ).toEqual({
        isPinching: true,
        lastPointerReleased: false,
        suppressBecausePinchEnded: false,
      });
    });

    it("clears pinch and suppresses draw commit on final release", () => {
      expect(
        derivePinchAfterPointerUp({
          wasPinching: true,
          remainingActivePointers: 0,
        })
      ).toEqual({
        isPinching: false,
        lastPointerReleased: true,
        suppressBecausePinchEnded: true,
      });
    });
  });

  describe("resolveCableLayerPointerUpPreflight", () => {
    it("ignores pointer-up while modal is open", () => {
      expect(
        resolveCableLayerPointerUpPreflight({
          isModalOpen: true,
          isPinching: false,
          suppressBecausePinchEnded: false,
        })
      ).toBe("ignore");
    });

    it("ignores pointer-up while pinch suppression is active", () => {
      expect(
        resolveCableLayerPointerUpPreflight({
          isModalOpen: false,
          isPinching: true,
          suppressBecausePinchEnded: false,
        })
      ).toBe("ignore");
    });

    it("uses explicit post-pinch suppression branch", () => {
      expect(
        resolveCableLayerPointerUpPreflight({
          isModalOpen: false,
          isPinching: false,
          suppressBecausePinchEnded: true,
        })
      ).toBe("ignore-after-pinch");
    });

    it("processes pointer-up when no blockers apply", () => {
      expect(
        resolveCableLayerPointerUpPreflight({
          isModalOpen: false,
          isPinching: false,
          suppressBecausePinchEnded: false,
        })
      ).toBe("process");
    });
  });

  describe("isPointerUpPrimary", () => {
    it("accepts touch and left mouse pointer-up events", () => {
      expect(isPointerUpPrimary(0, "mouse")).toBe(true);
      expect(isPointerUpPrimary(2, "touch")).toBe(true);
    });

    it("rejects non-left mouse buttons", () => {
      expect(isPointerUpPrimary(1, "mouse")).toBe(false);
      expect(isPointerUpPrimary(2, "mouse")).toBe(false);
    });
  });
});
