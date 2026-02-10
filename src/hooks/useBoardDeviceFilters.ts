import { useState, useMemo, useEffect, useCallback } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { DEVICE_TYPE_ORDER } from "../constants";
import { useStringFilter, useRangeFilter, isFilterActive, resetFilters, type StringFilter, type RangeFilter } from "./useFilterState";

const parseNum = (s: string): number | null => {
  const n = Number(s.trim());
  return s.trim() === "" || Number.isNaN(n) ? null : n;
};

interface HasWdh {
  wdh: [number, number, number];
}

/**
 * Shared size-range filtering for both boards and devices.
 * Takes a list of items with a Wdh property (Width, Depth, Height)
 * and applies min/max filters for width and depth.
 */
function applyDimensionFilters<T extends HasWdh>(list: T[], width: RangeFilter, depth: RangeFilter): T[] {
  const wMin = parseNum(width.min);
  const wMax = parseNum(width.max);
  const dMin = parseNum(depth.min);
  const dMax = parseNum(depth.max);
  if (wMin != null) list = list.filter((t) => t.wdh[0] >= wMin);
  if (wMax != null) list = list.filter((t) => t.wdh[0] <= wMax);
  if (dMin != null) list = list.filter((t) => t.wdh[1] >= dMin);
  if (dMax != null) list = list.filter((t) => t.wdh[1] <= dMax);
  return list;
}

interface HasTextFields {
  name?: string;
  brand?: string;
  model?: string;
}

/**
 * Filters a list of items whose name, brand, and/or model fields match a
 * text query (case-insensitive, partial match).
 */
function applyTextFilter<T extends HasTextFields>(list: T[], text: StringFilter): T[] {
  const q = text.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((t) => [t.name, t.brand, t.model].some((s) => s?.toLowerCase().includes(q)));
}

const minMax = (arr: number[]): readonly [number, number] => [Math.min(...arr), Math.max(...arr)] as const;

/**
 * Manages the state for board and device filters, including selected items,
 * brand/type filters, text search, and dimension ranges. Also computes
 * filtered lists based on the current filter state.
 */
export function useBoardDeviceFilters() {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");

  const boardBrand = useStringFilter();
  const boardText = useStringFilter();
  const boardWidth = useRangeFilter();
  const boardDepth = useRangeFilter();

  const deviceBrand = useStringFilter();
  const deviceType = useStringFilter();
  const deviceText = useStringFilter();
  const deviceWidth = useRangeFilter();
  const deviceDepth = useRangeFilter();

  const boardBrands = useMemo(() => {
    const set = new Set(BOARD_TEMPLATES.map((t) => t.brand).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const deviceBrands = useMemo(() => {
    let list = DEVICE_TEMPLATES;
    if (deviceType.value) {
      list = list.filter((t) => t.type === deviceType.value);
    }
    const set = new Set(list.map((t) => t.brand).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [deviceType.value]);

  const boardWidthRange = useMemo(() => minMax(BOARD_TEMPLATES.map((t) => t.wdh[0])), []);
  const boardDepthRange = useMemo(() => minMax(BOARD_TEMPLATES.map((t) => t.wdh[1])), []);
  const deviceWidthRange = useMemo(() => minMax(DEVICE_TEMPLATES.map((t) => t.wdh[0])), []);
  const deviceDepthRange = useMemo(() => minMax(DEVICE_TEMPLATES.map((t) => t.wdh[1])), []);

  const filteredBoards = useMemo(() => {
    let list = BOARD_TEMPLATES;
    if (boardBrand.value) list = list.filter((t) => t.brand === boardBrand.value);
    list = applyTextFilter(list, boardText);
    list = applyDimensionFilters(list, boardWidth, boardDepth);
    return [...list].sort((a, b) => {
      const byType = (a.type ?? "").localeCompare(b.type ?? "");
      if (byType !== 0) return byType;
      const byBrand = (a.brand ?? "").localeCompare(b.brand ?? "");
      if (byBrand !== 0) return byBrand;
      return (a.model ?? "").localeCompare(b.model ?? "");
    });
  }, [boardBrand.value, boardText.value, boardWidth.min, boardWidth.max, boardDepth.min, boardDepth.max]);

  const filteredDevices = useMemo(() => {
    let list = DEVICE_TEMPLATES.filter((t) => {
      if (deviceBrand.value && t.brand !== deviceBrand.value) return false;
      if (deviceType.value && t.type !== deviceType.value) return false;
      return true;
    });
    list = applyTextFilter(list, deviceText);
    list = applyDimensionFilters(list, deviceWidth, deviceDepth);
    return [...list].sort((a, b) => {
      const typeA = DEVICE_TYPE_ORDER.indexOf(a.type);
      const typeB = DEVICE_TYPE_ORDER.indexOf(b.type);
      const byType = (typeA === -1 ? 999 : typeA) - (typeB === -1 ? 999 : typeB);
      if (byType !== 0) return byType;
      const byBrand = (a.brand ?? "").localeCompare(b.brand ?? "");
      if (byBrand !== 0) return byBrand;
      return (a.model ?? "").localeCompare(b.model ?? "");
    });
  }, [deviceBrand.value, deviceType.value, deviceText.value, deviceWidth.min, deviceWidth.max, deviceDepth.min, deviceDepth.max]);

  useEffect(() => {
    if (selectedBoard && !filteredBoards.some((t) => t.id === selectedBoard)) setSelectedBoard("");
  }, [selectedBoard, filteredBoards]);

  useEffect(() => {
    if (selectedDevice && !filteredDevices.some((t) => t.id === selectedDevice)) setSelectedDevice("");
  }, [selectedDevice, filteredDevices]);

  useEffect(() => {
    if (deviceBrand.value && !deviceBrands.includes(deviceBrand.value)) deviceBrand.set("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceBrand.value, deviceBrands]);

  const hasBoardFilters = isFilterActive(boardBrand, boardText, boardWidth, boardDepth);
  const hasDeviceFilters = isFilterActive(deviceBrand, deviceType, deviceText, deviceWidth, deviceDepth);

  const resetBoardFilters = useCallback(
    () => resetFilters(boardBrand, boardText, boardWidth, boardDepth),
    // Setters are stable (from useState), objects are new each render but setters inside are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const resetDeviceFilters = useCallback(
    () => resetFilters(deviceBrand, deviceType, deviceText, deviceWidth, deviceDepth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    selectedBoard, setSelectedBoard,
    selectedDevice, setSelectedDevice,
    boardBrand, boardText, boardWidth, boardDepth,
    deviceBrand, deviceType, deviceText, deviceWidth, deviceDepth,
    boardBrands, deviceBrands,
    boardWidthRange, boardDepthRange,
    deviceWidthRange, deviceDepthRange,
    filteredBoards, filteredDevices,
    hasBoardFilters, hasDeviceFilters,
    resetBoardFilters, resetDeviceFilters,
  };
}
