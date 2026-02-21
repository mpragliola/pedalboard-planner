import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";
import type { RangeFilter, StringFilter } from "../hooks/useFilterState";

/** Stable public contract for catalog filter state/behavior shared across contexts/components. */
export interface CatalogFilters {
  selectedBoard: string;
  setSelectedBoard: (value: string) => void;
  selectedDevice: string;
  setSelectedDevice: (value: string) => void;

  boardBrand: StringFilter;
  boardText: StringFilter;
  boardWidth: RangeFilter;
  boardDepth: RangeFilter;

  deviceBrand: StringFilter;
  deviceType: StringFilter;
  deviceText: StringFilter;
  deviceWidth: RangeFilter;
  deviceDepth: RangeFilter;

  boardBrands: string[];
  deviceBrands: string[];
  boardWidthRange: readonly [number, number];
  boardDepthRange: readonly [number, number];
  deviceWidthRange: readonly [number, number];
  deviceDepthRange: readonly [number, number];

  filteredBoards: BoardTemplate[];
  filteredDevices: DeviceTemplate[];
  hasBoardFilters: boolean;
  hasDeviceFilters: boolean;
  resetBoardFilters: () => void;
  resetDeviceFilters: () => void;
}
