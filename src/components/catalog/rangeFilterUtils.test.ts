import { describe, expect, it, vi } from "vitest";
import { applyRangeUpdate, clampToValidRange } from "./rangeFilterUtils";

describe("rangeFilterUtils", () => {
  describe("clampToValidRange", () => {
    it("clamps both values to bounds", () => {
      expect(clampToValidRange([-10, 999], [0, 100])).toEqual([0, 100]);
    });

    it("returns sorted range when values are inverted", () => {
      expect(clampToValidRange([80, 20], [0, 100])).toEqual([20, 80]);
    });
  });

  describe("applyRangeUpdate", () => {
    it("normalizes full-boundary values as empty strings", () => {
      const filter = { min: "", max: "", setMin: vi.fn(), setMax: vi.fn() };
      applyRangeUpdate([10, 50], filter, [10, 50]);
      expect(filter.setMin).toHaveBeenCalledWith("");
      expect(filter.setMax).toHaveBeenCalledWith("");
    });

    it("writes explicit values for non-boundary filters", () => {
      const filter = { min: "", max: "", setMin: vi.fn(), setMax: vi.fn() };
      applyRangeUpdate([10, 50], filter, [20, 40]);
      expect(filter.setMin).toHaveBeenCalledWith("20");
      expect(filter.setMax).toHaveBeenCalledWith("40");
    });
  });
});
