import { describe, it, expect } from "vitest";
import {
  LONG_PRESS_MS,
  MOVE_THRESHOLD_PX,
  MM_TO_PX,
  ZOOM_MIN,
  ZOOM_MAX,
  DEFAULT_PLACEMENT_FALLBACK,
  DEVICE_TYPE_ORDER,
  initialObjects,
} from "./constants";

describe("constants", () => {
  describe("catalog drag", () => {
    it("LONG_PRESS_MS is positive and reasonable for touch", () => {
      expect(LONG_PRESS_MS).toBeGreaterThanOrEqual(300);
      expect(LONG_PRESS_MS).toBeLessThanOrEqual(800);
    });

    it("MOVE_THRESHOLD_PX allows small finger movement during long-press", () => {
      expect(MOVE_THRESHOLD_PX).toBeGreaterThan(0);
      expect(MOVE_THRESHOLD_PX).toBeLessThanOrEqual(30);
    });
  });

  describe("MM_TO_PX", () => {
    it("is a positive number", () => {
      expect(MM_TO_PX).toBeGreaterThan(0);
    });
  });

  describe("zoom", () => {
    it("ZOOM_MIN is less than ZOOM_MAX", () => {
      expect(ZOOM_MIN).toBeLessThan(ZOOM_MAX);
    });

    it("ZOOM_MIN and ZOOM_MAX are positive", () => {
      expect(ZOOM_MIN).toBeGreaterThan(0);
      expect(ZOOM_MAX).toBeGreaterThan(0);
    });
  });

  describe("DEFAULT_PLACEMENT_FALLBACK", () => {
    it("has x and y coordinates", () => {
      expect(DEFAULT_PLACEMENT_FALLBACK).toHaveProperty("x");
      expect(DEFAULT_PLACEMENT_FALLBACK).toHaveProperty("y");
      expect(typeof DEFAULT_PLACEMENT_FALLBACK.x).toBe("number");
      expect(typeof DEFAULT_PLACEMENT_FALLBACK.y).toBe("number");
    });
  });

  describe("DEVICE_TYPE_ORDER", () => {
    it("contains expected device types", () => {
      expect(DEVICE_TYPE_ORDER).toContain("pedal");
      expect(DEVICE_TYPE_ORDER).toContain("multifx");
    });
  });

  describe("initialObjects", () => {
    it("is an empty array", () => {
      expect(initialObjects).toEqual([]);
    });
  });
});
