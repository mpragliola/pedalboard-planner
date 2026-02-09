import { useReducer, useMemo, useEffect, useCallback } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { DEVICE_TYPE_ORDER } from "../constants";

interface FiltersState {
  selectedBoard: string;
  selectedDevice: string;
  boardBrandFilter: string;
  boardTextFilter: string;
  boardWidthMin: string;
  boardWidthMax: string;
  boardDepthMin: string;
  boardDepthMax: string;
  deviceBrandFilter: string;
  deviceTypeFilter: string;
  deviceTextFilter: string;
  deviceWidthMin: string;
  deviceWidthMax: string;
  deviceDepthMin: string;
  deviceDepthMax: string;
}

const initialState: FiltersState = {
  selectedBoard: "",
  selectedDevice: "",
  boardBrandFilter: "",
  boardTextFilter: "",
  boardWidthMin: "",
  boardWidthMax: "",
  boardDepthMin: "",
  boardDepthMax: "",
  deviceBrandFilter: "",
  deviceTypeFilter: "",
  deviceTextFilter: "",
  deviceWidthMin: "",
  deviceWidthMax: "",
  deviceDepthMin: "",
  deviceDepthMax: "",
};

type FiltersAction =
  | { type: "set"; field: keyof FiltersState; value: string }
  | { type: "resetBoard" }
  | { type: "resetDevice" };

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
  switch (action.type) {
    case "set":
      if (state[action.field] === action.value) return state;
      return { ...state, [action.field]: action.value };
    case "resetBoard":
      return {
        ...state,
        boardBrandFilter: "",
        boardTextFilter: "",
        boardWidthMin: "",
        boardWidthMax: "",
        boardDepthMin: "",
        boardDepthMax: "",
      };
    case "resetDevice":
      return {
        ...state,
        deviceBrandFilter: "",
        deviceTypeFilter: "",
        deviceTextFilter: "",
        deviceWidthMin: "",
        deviceWidthMax: "",
        deviceDepthMin: "",
        deviceDepthMax: "",
      };
  }
}

function useSetter(dispatch: React.Dispatch<FiltersAction>, field: keyof FiltersState) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((value: string) => dispatch({ type: "set", field, value }), [dispatch, field]);
}

const parseNum = (s: string): number | null => {
  const n = Number(s.trim());
  return s.trim() === "" || Number.isNaN(n) ? null : n;
};

interface HasWdh {
  wdh: [number, number, number];
}

/** 
 * Shared size-range filtering for both boards and devices. 
 * Takes a list of items with a Whd property (Width, Height, Depth) 
 * and applies min/max filters for width and depth.
 */
function applyDimensionFilters<T extends HasWdh>(
  list: T[],
  widthMin: string,
  widthMax: string,
  depthMin: string,
  depthMax: string
): T[] {
  const wMin = parseNum(widthMin);
  const wMax = parseNum(widthMax);
  const dMin = parseNum(depthMin);
  const dMax = parseNum(depthMax);
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
 * Filters a list of item whose name, brand, and/or model fields match a
 * text query (case-insensitive, also partial match).
 */
function applyTextFilter<T extends HasTextFields>(list: T[], text: string): T[] {
  const q = text.trim().toLowerCase();
  if (!q) return list;
  return list.filter((t) => [t.name, t.brand, t.model].some((s) => s?.toLowerCase().includes(q)));
}

/**
 * It manages the state for board and device filters, including selected items, 
 * brand/type filters, text search, and dimension ranges. It also computes 
 * the filtered lists of boards and devices based on the current filter state.
 */
export function useBoardDeviceFilters() {
  const [state, dispatch] = useReducer(filtersReducer, initialState);
  const {
    selectedBoard,
    selectedDevice,
    boardBrandFilter,
    boardTextFilter,
    boardWidthMin,
    boardWidthMax,
    boardDepthMin,
    boardDepthMax,
    deviceBrandFilter,
    deviceTypeFilter,
    deviceTextFilter,
    deviceWidthMin,
    deviceWidthMax,
    deviceDepthMin,
    deviceDepthMax,
  } = state;

  const setSelectedBoard = useSetter(dispatch, "selectedBoard");
  const setSelectedDevice = useSetter(dispatch, "selectedDevice");
  const setBoardBrandFilter = useSetter(dispatch, "boardBrandFilter");
  const setBoardTextFilter = useSetter(dispatch, "boardTextFilter");
  const setBoardWidthMin = useSetter(dispatch, "boardWidthMin");
  const setBoardWidthMax = useSetter(dispatch, "boardWidthMax");
  const setBoardDepthMin = useSetter(dispatch, "boardDepthMin");
  const setBoardDepthMax = useSetter(dispatch, "boardDepthMax");
  const setDeviceBrandFilter = useSetter(dispatch, "deviceBrandFilter");
  const setDeviceTypeFilter = useSetter(dispatch, "deviceTypeFilter");
  const setDeviceTextFilter = useSetter(dispatch, "deviceTextFilter");
  const setDeviceWidthMin = useSetter(dispatch, "deviceWidthMin");
  const setDeviceWidthMax = useSetter(dispatch, "deviceWidthMax");
  const setDeviceDepthMin = useSetter(dispatch, "deviceDepthMin");
  const setDeviceDepthMax = useSetter(dispatch, "deviceDepthMax");

  const boardBrands = useMemo(() => {
    const set = new Set(BOARD_TEMPLATES.map((t) => t.brand).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const deviceBrands = useMemo(() => {
    let list = DEVICE_TEMPLATES;
    if (deviceTypeFilter) {
      list = list.filter((t) => t.type === deviceTypeFilter);
    }
    const set = new Set(list.map((t) => t.brand).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [deviceTypeFilter]);

  const minMax = (arr: number[]): [number, number] => {
    return [Math.min(...arr), Math.max(...arr)];
  }

  const boardWidthRange = useMemo(() => minMax(BOARD_TEMPLATES.map((t) => t.wdh[0])), []);
  const boardDepthRange = useMemo(() => minMax(BOARD_TEMPLATES.map((t) => t.wdh[1])), []);
  const deviceWidthRange = useMemo(() => minMax(DEVICE_TEMPLATES.map((t) => t.wdh[0])), []);
  const deviceDepthRange = useMemo(() => minMax(DEVICE_TEMPLATES.map((t) => t.wdh[1])), []);

  /**
   * Filtering logic for boards and devices. It applies brand/type filters, text search, and 
   * dimension range filters to the full list of templates. 
   * The resulting filtered lists are memoized for performance. 
   * It also sorts the filtered lists by type, brand, and model for better UX.
   */
  const filteredBoards = useMemo(() => {
    let list = BOARD_TEMPLATES;
    if (boardBrandFilter) list = list.filter((t) => t.brand === boardBrandFilter);
    list = applyTextFilter(list, boardTextFilter);
    list = applyDimensionFilters(list, boardWidthMin, boardWidthMax, boardDepthMin, boardDepthMax);
    return [...list].sort((a, b) => {
      const byType = (a.type ?? "").localeCompare(b.type ?? "");
      if (byType !== 0) return byType;
      const byBrand = (a.brand ?? "").localeCompare(b.brand ?? "");
      if (byBrand !== 0) return byBrand;
      return (a.model ?? "").localeCompare(b.model ?? "");
    });
  }, [boardBrandFilter, boardTextFilter, boardWidthMin, boardWidthMax, boardDepthMin, boardDepthMax]);

  const filteredDevices = useMemo(() => {
    let list = DEVICE_TEMPLATES.filter((t) => {
      if (deviceBrandFilter && t.brand !== deviceBrandFilter) return false;
      if (deviceTypeFilter && t.type !== deviceTypeFilter) return false;
      return true;
    });
    list = applyTextFilter(list, deviceTextFilter);
    list = applyDimensionFilters(list, deviceWidthMin, deviceWidthMax, deviceDepthMin, deviceDepthMax);
    return [...list].sort((a, b) => {
      const typeA = DEVICE_TYPE_ORDER.indexOf(a.type);
      const typeB = DEVICE_TYPE_ORDER.indexOf(b.type);
      const byType = (typeA === -1 ? 999 : typeA) - (typeB === -1 ? 999 : typeB);
      if (byType !== 0) return byType;
      const byBrand = (a.brand ?? "").localeCompare(b.brand ?? "");
      if (byBrand !== 0) return byBrand;
      return (a.model ?? "").localeCompare(b.model ?? "");
    });
  }, [
    deviceBrandFilter,
    deviceTypeFilter,
    deviceTextFilter,
    deviceWidthMin,
    deviceWidthMax,
    deviceDepthMin,
    deviceDepthMax,
  ]);

  useEffect(() => {
    if (selectedBoard && !filteredBoards.some((t) => t.id === selectedBoard)) setSelectedBoard("");
  }, [selectedBoard, filteredBoards, setSelectedBoard]);

  useEffect(() => {
    if (selectedDevice && !filteredDevices.some((t) => t.id === selectedDevice)) setSelectedDevice("");
  }, [selectedDevice, filteredDevices, setSelectedDevice]);

  useEffect(() => {
    if (deviceBrandFilter && !deviceBrands.includes(deviceBrandFilter)) setDeviceBrandFilter("");
  }, [deviceBrandFilter, deviceBrands, setDeviceBrandFilter]);

  const resetBoardFilters = useCallback(() => dispatch({ type: "resetBoard" }), []);
  const resetDeviceFilters = useCallback(() => dispatch({ type: "resetDevice" }), []);

  return {
    selectedBoard, setSelectedBoard,
    selectedDevice, setSelectedDevice,
    boardBrandFilter, setBoardBrandFilter,
    boardTextFilter, setBoardTextFilter,
    boardWidthMin, setBoardWidthMin,
    boardWidthMax, setBoardWidthMax,
    boardDepthMin, setBoardDepthMin,
    boardDepthMax, setBoardDepthMax,
    deviceBrandFilter, setDeviceBrandFilter,
    deviceTypeFilter, setDeviceTypeFilter,
    deviceTextFilter, setDeviceTextFilter,
    deviceWidthMin, setDeviceWidthMin,
    deviceWidthMax, setDeviceWidthMax,
    deviceDepthMin, setDeviceDepthMin,
    deviceDepthMax, setDeviceDepthMax,
    boardWidthRange, boardDepthRange,
    deviceWidthRange, deviceDepthRange,
    boardBrands, deviceBrands,
    filteredBoards, filteredDevices,
    resetBoardFilters, resetDeviceFilters,
  };
}
