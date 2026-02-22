import { describe, expect, it } from "vitest";
import {
  canHandleCableLayerPointerDown,
  isPrimaryCableLayerPointer,
  resolveCableLayerPointerDownDecision,
} from "./cableLayerPointerDown";

describe("cableLayerPointerDown", () => {
  describe("canHandleCableLayerPointerDown", () => {
    it("returns true only for eligible pointer-down preflight state", () => {
      // Baseline happy path: all blockers are off.
      expect(
        canHandleCableLayerPointerDown({
          isModalOpen: false,
          isPrimaryPointer: true,
          overActions: false,
          spaceDown: false,
        })
      ).toBe(true);
    });

    it("returns false when any preflight blocker is active", () => {
      // Each blocker is tested independently so regressions in preflight precedence are obvious.
      expect(
        canHandleCableLayerPointerDown({
          isModalOpen: true,
          isPrimaryPointer: true,
          overActions: false,
          spaceDown: false,
        })
      ).toBe(false);
      expect(
        canHandleCableLayerPointerDown({
          isModalOpen: false,
          isPrimaryPointer: false,
          overActions: false,
          spaceDown: false,
        })
      ).toBe(false);
      expect(
        canHandleCableLayerPointerDown({
          isModalOpen: false,
          isPrimaryPointer: true,
          overActions: true,
          spaceDown: false,
        })
      ).toBe(false);
      expect(
        canHandleCableLayerPointerDown({
          isModalOpen: false,
          isPrimaryPointer: true,
          overActions: false,
          spaceDown: true,
        })
      ).toBe(false);
    });
  });

  describe("resolveCableLayerPointerDownDecision", () => {
    it("prioritizes pinch transition when two pointers are active", () => {
      // activePointerCount takes precedence over other states.
      expect(
        resolveCableLayerPointerDownDecision({
          activePointerCount: 2,
          isPinching: false,
          isDoubleTap: false,
        })
      ).toBe("begin-pinch");
    });

    it("ignores draw when pinching is already active", () => {
      // While pinching, pointer-down cannot become draw input.
      expect(
        resolveCableLayerPointerDownDecision({
          activePointerCount: 1,
          isPinching: true,
          isDoubleTap: false,
        })
      ).toBe("ignore");
    });

    it("routes double tap to finish/exit path", () => {
      // Double tap remains a first-class interaction even after guard extraction.
      expect(
        resolveCableLayerPointerDownDecision({
          activePointerCount: 1,
          isPinching: false,
          isDoubleTap: true,
        })
      ).toBe("double-tap");
    });

    it("starts normal draw when no guard condition applies", () => {
      // Default decision is draw.
      expect(
        resolveCableLayerPointerDownDecision({
          activePointerCount: 1,
          isPinching: false,
          isDoubleTap: false,
        })
      ).toBe("draw");
    });
  });

  describe("isPrimaryCableLayerPointer", () => {
    it("accepts left-click and touch pointer types", () => {
      expect(isPrimaryCableLayerPointer(0, "mouse")).toBe(true);
      expect(isPrimaryCableLayerPointer(2, "touch")).toBe(true);
    });

    it("rejects non-left mouse pointers", () => {
      expect(isPrimaryCableLayerPointer(1, "mouse")).toBe(false);
      expect(isPrimaryCableLayerPointer(2, "mouse")).toBe(false);
    });
  });
});
