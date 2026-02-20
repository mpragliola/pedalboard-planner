import { useState, useMemo, useEffect, useCallback } from "react";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";
import {
  deriveBoardBrands,
  deriveDeviceBrands,
  deriveTemplateRange,
  filterAndSortBoards,
  filterAndSortDevices,
} from "../lib/catalogFilters";
import { useStringFilter, useRangeFilter, isFilterActive, resetFilters } from "./useFilterState";

interface UseBoardDeviceFiltersInput {
  boardTemplates: BoardTemplate[];
  deviceTemplates: DeviceTemplate[];
}

/**
 * Manages the state for board and device filters, including selected items,
 * brand/type filters, text search, and dimension ranges. Also computes
 * filtered lists based on the current filter state.
 */
export function useBoardDeviceFilters({ boardTemplates, deviceTemplates }: UseBoardDeviceFiltersInput) {
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

  const boardBrands = useMemo(() => deriveBoardBrands(boardTemplates), [boardTemplates]);

  const deviceBrands = useMemo(
    () => deriveDeviceBrands(deviceTemplates, deviceType.value),
    [deviceTemplates, deviceType.value]
  );

  const boardWidthRange = useMemo(() => deriveTemplateRange(boardTemplates, 0), [boardTemplates]);
  const boardDepthRange = useMemo(() => deriveTemplateRange(boardTemplates, 1), [boardTemplates]);
  const deviceWidthRange = useMemo(() => deriveTemplateRange(deviceTemplates, 0), [deviceTemplates]);
  const deviceDepthRange = useMemo(() => deriveTemplateRange(deviceTemplates, 1), [deviceTemplates]);

  const filteredBoards = useMemo(
    () =>
      filterAndSortBoards(boardTemplates, {
        brand: boardBrand.value,
        text: boardText.value,
        width: boardWidth,
        depth: boardDepth,
      }),
    [boardTemplates, boardBrand.value, boardText.value, boardWidth.min, boardWidth.max, boardDepth.min, boardDepth.max]
  );

  const filteredDevices = useMemo(
    () =>
      filterAndSortDevices(deviceTemplates, {
        brand: deviceBrand.value,
        type: deviceType.value,
        text: deviceText.value,
        width: deviceWidth,
        depth: deviceDepth,
      }),
    [
      deviceTemplates,
      deviceBrand.value,
      deviceType.value,
      deviceText.value,
      deviceWidth.min,
      deviceWidth.max,
      deviceDepth.min,
      deviceDepth.max,
    ]
  );

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
