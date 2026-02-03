import { useState, useMemo, useEffect } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { DEVICE_TYPE_ORDER } from "../constants";

export function useBoardDeviceFilters() {
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [boardBrandFilter, setBoardBrandFilter] = useState<string>("");
  const [boardTextFilter, setBoardTextFilter] = useState<string>("");
  const [boardWidthMin, setBoardWidthMin] = useState<string>("");
  const [boardWidthMax, setBoardWidthMax] = useState<string>("");
  const [boardDepthMin, setBoardDepthMin] = useState<string>("");
  const [boardDepthMax, setBoardDepthMax] = useState<string>("");
  const [deviceBrandFilter, setDeviceBrandFilter] = useState<string>("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("");
  const [deviceTextFilter, setDeviceTextFilter] = useState<string>("");
  const [deviceWidthMin, setDeviceWidthMin] = useState<string>("");
  const [deviceWidthMax, setDeviceWidthMax] = useState<string>("");
  const [deviceDepthMin, setDeviceDepthMin] = useState<string>("");
  const [deviceDepthMax, setDeviceDepthMax] = useState<string>("");

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

  const boardWidthRange = useMemo(() => {
    const widths = BOARD_TEMPLATES.map((t) => t.wdh[0]);
    return [Math.min(...widths), Math.max(...widths)] as const;
  }, []);
  const boardDepthRange = useMemo(() => {
    const depths = BOARD_TEMPLATES.map((t) => t.wdh[1]);
    return [Math.min(...depths), Math.max(...depths)] as const;
  }, []);
  const deviceWidthRange = useMemo(() => {
    const widths = DEVICE_TEMPLATES.map((t) => t.wdh[0]);
    return [Math.min(...widths), Math.max(...widths)] as const;
  }, []);
  const deviceDepthRange = useMemo(() => {
    const depths = DEVICE_TEMPLATES.map((t) => t.wdh[1]);
    return [Math.min(...depths), Math.max(...depths)] as const;
  }, []);

  const parseNum = (s: string): number | null => {
    const n = Number(s.trim());
    return s.trim() === "" || Number.isNaN(n) ? null : n;
  };

  const filteredBoards = useMemo(() => {
    let list = BOARD_TEMPLATES;
    if (boardBrandFilter) list = list.filter((t) => t.brand === boardBrandFilter);
    const q = boardTextFilter.trim().toLowerCase();
    if (q) list = list.filter((t) => [t.name, t.brand, t.model].some((s) => s?.toLowerCase().includes(q)));
    const wMin = parseNum(boardWidthMin);
    const wMax = parseNum(boardWidthMax);
    const dMin = parseNum(boardDepthMin);
    const dMax = parseNum(boardDepthMax);
    if (wMin != null) list = list.filter((t) => t.wdh[0] >= wMin);
    if (wMax != null) list = list.filter((t) => t.wdh[0] <= wMax);
    if (dMin != null) list = list.filter((t) => t.wdh[1] >= dMin);
    if (dMax != null) list = list.filter((t) => t.wdh[1] <= dMax);
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
    const q = deviceTextFilter.trim().toLowerCase();
    if (q) list = list.filter((t) => [t.name, t.brand, t.model].some((s) => s?.toLowerCase().includes(q)));
    const wMin = parseNum(deviceWidthMin);
    const wMax = parseNum(deviceWidthMax);
    const dMin = parseNum(deviceDepthMin);
    const dMax = parseNum(deviceDepthMax);
    if (wMin != null) list = list.filter((t) => t.wdh[0] >= wMin);
    if (wMax != null) list = list.filter((t) => t.wdh[0] <= wMax);
    if (dMin != null) list = list.filter((t) => t.wdh[1] >= dMin);
    if (dMax != null) list = list.filter((t) => t.wdh[1] <= dMax);
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
  }, [selectedBoard, filteredBoards]);

  useEffect(() => {
    if (selectedDevice && !filteredDevices.some((t) => t.id === selectedDevice)) setSelectedDevice("");
  }, [selectedDevice, filteredDevices]);

  useEffect(() => {
    if (deviceBrandFilter && !deviceBrands.includes(deviceBrandFilter)) setDeviceBrandFilter("");
  }, [deviceBrandFilter, deviceBrands, setDeviceBrandFilter]);

  const resetBoardFilters = () => {
    setBoardBrandFilter("");
    setBoardTextFilter("");
    setBoardWidthMin("");
    setBoardWidthMax("");
    setBoardDepthMin("");
    setBoardDepthMax("");
  };

  const resetDeviceFilters = () => {
    setDeviceBrandFilter("");
    setDeviceTypeFilter("");
    setDeviceTextFilter("");
    setDeviceWidthMin("");
    setDeviceWidthMax("");
    setDeviceDepthMin("");
    setDeviceDepthMax("");
  };

  return {
    selectedBoard,
    setSelectedBoard,
    selectedDevice,
    setSelectedDevice,
    boardBrandFilter,
    setBoardBrandFilter,
    boardTextFilter,
    setBoardTextFilter,
    boardWidthMin,
    setBoardWidthMin,
    boardWidthMax,
    setBoardWidthMax,
    boardDepthMin,
    setBoardDepthMin,
    boardDepthMax,
    setBoardDepthMax,
    deviceBrandFilter,
    setDeviceBrandFilter,
    deviceTypeFilter,
    setDeviceTypeFilter,
    deviceTextFilter,
    setDeviceTextFilter,
    deviceWidthMin,
    setDeviceWidthMin,
    deviceWidthMax,
    setDeviceWidthMax,
    deviceDepthMin,
    setDeviceDepthMin,
    deviceDepthMax,
    setDeviceDepthMax,
    boardWidthRange,
    boardDepthRange,
    deviceWidthRange,
    deviceDepthRange,
    boardBrands,
    deviceBrands,
    filteredBoards,
    filteredDevices,
    resetBoardFilters,
    resetDeviceFilters,
  };
}
