import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { isFilterActive, resetFilters, useRangeFilter, useStringFilter } from "./useFilterState";

describe("useFilterState", () => {
  describe("useStringFilter", () => {
    it("starts empty by default and updates value", () => {
      const { result } = renderHook(() => useStringFilter());

      expect(result.current.value).toBe("");
      act(() => result.current.set("Boss"));
      expect(result.current.value).toBe("Boss");
    });

    it("supports custom initial values", () => {
      const { result } = renderHook(() => useStringFilter("initial"));
      expect(result.current.value).toBe("initial");
    });
  });

  describe("useRangeFilter", () => {
    it("tracks min/max values independently", () => {
      const { result } = renderHook(() => useRangeFilter());

      expect(result.current.min).toBe("");
      expect(result.current.max).toBe("");

      act(() => {
        result.current.setMin("100");
        result.current.setMax("300");
      });

      expect(result.current.min).toBe("100");
      expect(result.current.max).toBe("300");
    });
  });

  describe("helpers", () => {
    it("detects active string and range filters", () => {
      expect(isFilterActive({ value: "", set: vi.fn() })).toBe(false);
      expect(isFilterActive({ value: "Boss", set: vi.fn() })).toBe(true);
      expect(isFilterActive({ min: "", max: "", setMin: vi.fn(), setMax: vi.fn() })).toBe(false);
      expect(isFilterActive({ min: "100", max: "", setMin: vi.fn(), setMax: vi.fn() })).toBe(true);
      expect(isFilterActive({ min: "", max: "300", setMin: vi.fn(), setMax: vi.fn() })).toBe(true);
    });

    it("treats whitespace as active (raw input semantics)", () => {
      expect(isFilterActive({ value: " ", set: vi.fn() })).toBe(true);
      expect(isFilterActive({ min: " ", max: "", setMin: vi.fn(), setMax: vi.fn() })).toBe(true);
    });

    it("resets both string and range filters", () => {
      const stringFilter = { value: "Boss", set: vi.fn() };
      const rangeFilter = { min: "100", max: "300", setMin: vi.fn(), setMax: vi.fn() };

      resetFilters(stringFilter, rangeFilter);

      expect(stringFilter.set).toHaveBeenCalledWith("");
      expect(rangeFilter.setMin).toHaveBeenCalledWith("");
      expect(rangeFilter.setMax).toHaveBeenCalledWith("");
    });
  });
});
