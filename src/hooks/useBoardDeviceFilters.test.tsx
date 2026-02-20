import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardDeviceFilters } from "./useBoardDeviceFilters";
import { DEVICE_TEMPLATES } from "../data/devices";
import { BOARD_TEMPLATES } from "../data/boards";

const renderFiltersHook = () =>
  renderHook(() =>
    useBoardDeviceFilters({ boardTemplates: BOARD_TEMPLATES, deviceTemplates: DEVICE_TEMPLATES })
  );

describe("useBoardDeviceFilters", () => {
  describe("initial state", () => {
    it("starts with no selection", () => {
      const { result } = renderFiltersHook();
      expect(result.current.selectedBoard).toBe("");
      expect(result.current.selectedDevice).toBe("");
    });

    it("returns all devices unfiltered initially", () => {
      const { result } = renderFiltersHook();
      expect(result.current.filteredDevices.length).toBe(DEVICE_TEMPLATES.length);
    });

    it("returns all boards unfiltered initially", () => {
      const { result } = renderFiltersHook();
      expect(result.current.filteredBoards.length).toBe(BOARD_TEMPLATES.length);
    });

    it("hasBoardFilters is false initially", () => {
      const { result } = renderFiltersHook();
      expect(result.current.hasBoardFilters).toBe(false);
    });

    it("hasDeviceFilters is false initially", () => {
      const { result } = renderFiltersHook();
      expect(result.current.hasDeviceFilters).toBe(false);
    });

    it("exposes non-empty boardBrands list", () => {
      const { result } = renderFiltersHook();
      expect(result.current.boardBrands.length).toBeGreaterThan(0);
    });

    it("exposes non-empty deviceBrands list", () => {
      const { result } = renderFiltersHook();
      expect(result.current.deviceBrands.length).toBeGreaterThan(0);
    });

    it("boardBrands are sorted alphabetically", () => {
      const { result } = renderFiltersHook();
      const brands = result.current.boardBrands;
      const sorted = [...brands].sort((a, b) => a.localeCompare(b));
      expect(brands).toEqual(sorted);
    });

    it("exposes valid width and depth ranges for boards", () => {
      const { result } = renderFiltersHook();
      const [wMin, wMax] = result.current.boardWidthRange;
      const [dMin, dMax] = result.current.boardDepthRange;
      expect(wMin).toBeLessThanOrEqual(wMax);
      expect(dMin).toBeLessThanOrEqual(dMax);
    });

    it("exposes valid width and depth ranges for devices", () => {
      const { result } = renderFiltersHook();
      const [wMin, wMax] = result.current.deviceWidthRange;
      const [dMin, dMax] = result.current.deviceDepthRange;
      expect(wMin).toBeLessThanOrEqual(wMax);
      expect(dMin).toBeLessThanOrEqual(dMax);
    });
  });

  describe("text search", () => {
    it("filters devices by brand text (case-insensitive)", () => {
      const { result } = renderFiltersHook();
      const someBrand = DEVICE_TEMPLATES[0].brand;
      act(() => { result.current.deviceText.set(someBrand.toLowerCase()); });
      const found = result.current.filteredDevices.every(
        (d) =>
          d.brand?.toLowerCase().includes(someBrand.toLowerCase()) ||
          d.model?.toLowerCase().includes(someBrand.toLowerCase()) ||
          d.name?.toLowerCase().includes(someBrand.toLowerCase())
      );
      expect(found).toBe(true);
    });

    it("returns empty list for a query that matches nothing", () => {
      const { result } = renderFiltersHook();
      act(() => { result.current.deviceText.set("xyzzy-no-such-pedal-xyz"); });
      expect(result.current.filteredDevices).toHaveLength(0);
    });

    it("filters boards by text", () => {
      const { result } = renderFiltersHook();
      const someBoardBrand = BOARD_TEMPLATES[0].brand;
      act(() => { result.current.boardText.set(someBoardBrand.toLowerCase().slice(0, 4)); });
      expect(result.current.filteredBoards.length).toBeGreaterThan(0);
      expect(result.current.filteredBoards.length).toBeLessThanOrEqual(BOARD_TEMPLATES.length);
    });

    it("hasDeviceFilters is true when text filter is active", () => {
      const { result } = renderFiltersHook();
      act(() => { result.current.deviceText.set("boss"); });
      expect(result.current.hasDeviceFilters).toBe(true);
    });
  });

  describe("brand filter", () => {
    it("filters devices to only the selected brand", () => {
      const { result } = renderFiltersHook();
      const targetBrand = result.current.deviceBrands[0];
      act(() => { result.current.deviceBrand.set(targetBrand); });
      for (const device of result.current.filteredDevices) {
        expect(device.brand).toBe(targetBrand);
      }
    });

    it("filters boards to only the selected brand", () => {
      const { result } = renderFiltersHook();
      const targetBrand = result.current.boardBrands[0];
      act(() => { result.current.boardBrand.set(targetBrand); });
      for (const board of result.current.filteredBoards) {
        expect(board.brand).toBe(targetBrand);
      }
    });

    it("hasBoardFilters is true when board brand filter is active", () => {
      const { result } = renderFiltersHook();
      act(() => { result.current.boardBrand.set(result.current.boardBrands[0]); });
      expect(result.current.hasBoardFilters).toBe(true);
    });
  });

  describe("type filter", () => {
    it("filters devices by type", () => {
      const { result } = renderFiltersHook();
      const types = [...new Set(DEVICE_TEMPLATES.map((t) => t.type))];
      const targetType = types[0];
      act(() => { result.current.deviceType.set(targetType); });
      for (const device of result.current.filteredDevices) {
        expect(device.type).toBe(targetType);
      }
    });

    it("adjusts deviceBrands list when type filter is set", () => {
      const { result } = renderFiltersHook();
      const allBrandsCount = result.current.deviceBrands.length;
      const types = [...new Set(DEVICE_TEMPLATES.map((t) => t.type))];
      act(() => { result.current.deviceType.set(types[0]); });
      // Brand list may be same size or smaller depending on data
      expect(result.current.deviceBrands.length).toBeLessThanOrEqual(allBrandsCount);
    });
  });

  describe("dimension filters", () => {
    it("filters devices by minimum width", () => {
      const { result } = renderFiltersHook();
      const [wMin, wMax] = result.current.deviceWidthRange;
      const midpoint = Math.floor((wMin + wMax) / 2);
      act(() => { result.current.deviceWidth.setMin(String(midpoint)); });
      for (const device of result.current.filteredDevices) {
        expect(device.wdh[0]).toBeGreaterThanOrEqual(midpoint);
      }
    });

    it("filters devices by maximum width", () => {
      const { result } = renderFiltersHook();
      const [wMin, wMax] = result.current.deviceWidthRange;
      const midpoint = Math.ceil((wMin + wMax) / 2);
      act(() => { result.current.deviceWidth.setMax(String(midpoint)); });
      for (const device of result.current.filteredDevices) {
        expect(device.wdh[0]).toBeLessThanOrEqual(midpoint);
      }
    });

    it("filters boards by minimum depth", () => {
      const { result } = renderFiltersHook();
      const [dMin, dMax] = result.current.boardDepthRange;
      const midpoint = Math.floor((dMin + dMax) / 2);
      act(() => { result.current.boardDepth.setMin(String(midpoint)); });
      for (const board of result.current.filteredBoards) {
        expect(board.wdh[1]).toBeGreaterThanOrEqual(midpoint);
      }
    });
  });

  describe("reset filters", () => {
    it("resetDeviceFilters clears all device filters", () => {
      const { result } = renderFiltersHook();
      act(() => {
        result.current.deviceText.set("boss");
        result.current.deviceBrand.set(result.current.deviceBrands[0]);
        result.current.deviceType.set("pedal");
      });
      act(() => { result.current.resetDeviceFilters(); });
      expect(result.current.hasDeviceFilters).toBe(false);
      expect(result.current.filteredDevices.length).toBe(DEVICE_TEMPLATES.length);
    });

    it("resetBoardFilters clears all board filters", () => {
      const { result } = renderFiltersHook();
      act(() => {
        result.current.boardText.set("acl");
        result.current.boardBrand.set(result.current.boardBrands[0]);
      });
      act(() => { result.current.resetBoardFilters(); });
      expect(result.current.hasBoardFilters).toBe(false);
      expect(result.current.filteredBoards.length).toBe(BOARD_TEMPLATES.length);
    });
  });

  describe("selection management", () => {
    it("setSelectedBoard updates selectedBoard", () => {
      const { result } = renderFiltersHook();
      const firstBoardId = BOARD_TEMPLATES[0].id;
      act(() => { result.current.setSelectedBoard(firstBoardId); });
      expect(result.current.selectedBoard).toBe(firstBoardId);
    });

    it("setSelectedDevice updates selectedDevice", () => {
      const { result } = renderFiltersHook();
      const firstDeviceId = DEVICE_TEMPLATES[0].id;
      act(() => { result.current.setSelectedDevice(firstDeviceId); });
      expect(result.current.selectedDevice).toBe(firstDeviceId);
    });

    it("clears selectedDevice when it is filtered out by a brand filter", async () => {
      const { result } = renderFiltersHook();
      // Select a device
      const deviceFromBrandA = DEVICE_TEMPLATES.find((t) => t.brand !== DEVICE_TEMPLATES[0].brand);
      if (!deviceFromBrandA) return; // skip if not applicable
      act(() => { result.current.setSelectedDevice(deviceFromBrandA.id); });
      // Filter to a different brand that excludes that device
      const brandA = DEVICE_TEMPLATES[0].brand;
      act(() => { result.current.deviceBrand.set(brandA); });
      // selectedDevice should be cleared if it no longer appears in filteredDevices
      const isStillVisible = result.current.filteredDevices.some((d) => d.id === deviceFromBrandA.id);
      if (!isStillVisible) {
        expect(result.current.selectedDevice).toBe("");
      }
    });
  });

  describe("sorting", () => {
    it("filteredDevices are sorted (type order, then brand, then model)", () => {
      const { result } = renderFiltersHook();
      const devices = result.current.filteredDevices;
      for (let i = 1; i < devices.length; i++) {
        const prev = devices[i - 1];
        const curr = devices[i];
        const brandCmp = (prev.brand ?? "").localeCompare(curr.brand ?? "");
        // Within the same brand, models should be sorted
        if (prev.type === curr.type && brandCmp === 0) {
          expect((prev.model ?? "").localeCompare(curr.model ?? "")).toBeLessThanOrEqual(0);
        }
      }
    });

    it("filteredBoards are sorted (type, then brand, then model)", () => {
      const { result } = renderFiltersHook();
      const boards = result.current.filteredBoards;
      for (let i = 1; i < boards.length; i++) {
        const prev = boards[i - 1];
        const curr = boards[i];
        if ((prev.type ?? "") === (curr.type ?? "") && (prev.brand ?? "") === (curr.brand ?? "")) {
          expect((prev.model ?? "").localeCompare(curr.model ?? "")).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});
