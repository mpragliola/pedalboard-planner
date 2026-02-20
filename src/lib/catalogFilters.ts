import { DEVICE_TYPE_ORDER } from "../constants/catalog";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";

export interface CatalogRangeFilterValue {
  min: string;
  max: string;
}

export interface BoardCatalogFilterValues {
  brand: string;
  text: string;
  width: CatalogRangeFilterValue;
  depth: CatalogRangeFilterValue;
}

export interface DeviceCatalogFilterValues {
  brand: string;
  type: string;
  text: string;
  width: CatalogRangeFilterValue;
  depth: CatalogRangeFilterValue;
}

interface HasWdh {
  wdh: [number, number, number];
}

interface HasTextFields {
  name?: string;
  brand?: string;
  model?: string;
}

function parseNum(value: string): number | null {
  const parsed = Number(value.trim());
  return value.trim() === "" || Number.isNaN(parsed) ? null : parsed;
}

/** Shared size-range filtering for templates exposing [width, depth, height]. */
export function applyDimensionFilters<T extends HasWdh>(
  list: readonly T[],
  width: CatalogRangeFilterValue,
  depth: CatalogRangeFilterValue
): T[] {
  const wMin = parseNum(width.min);
  const wMax = parseNum(width.max);
  const dMin = parseNum(depth.min);
  const dMax = parseNum(depth.max);
  let out = list;
  if (wMin != null) out = out.filter((item) => item.wdh[0] >= wMin);
  if (wMax != null) out = out.filter((item) => item.wdh[0] <= wMax);
  if (dMin != null) out = out.filter((item) => item.wdh[1] >= dMin);
  if (dMax != null) out = out.filter((item) => item.wdh[1] <= dMax);
  return [...out];
}

/** Case-insensitive text filter against name/brand/model. */
export function applyTextFilter<T extends HasTextFields>(list: readonly T[], text: string): T[] {
  const query = text.trim().toLowerCase();
  if (!query) return [...list];
  return list.filter((item) =>
    [item.name, item.brand, item.model].some((value) => value?.toLowerCase().includes(query))
  );
}

/** Returns [min, max] for a numeric list, or [0, 0] for empty input. */
export function minMax(values: readonly number[]): readonly [number, number] {
  if (values.length === 0) return [0, 0] as const;
  return [Math.min(...values), Math.max(...values)] as const;
}

/** Returns [min, max] range for width (axis 0) or depth (axis 1). */
export function deriveTemplateRange<T extends HasWdh>(
  templates: readonly T[],
  axis: 0 | 1
): readonly [number, number] {
  return minMax(templates.map((template) => template.wdh[axis]));
}

/** Distinct sorted board brands. */
export function deriveBoardBrands(boards: readonly BoardTemplate[]): string[] {
  const set = new Set(boards.map((board) => board.brand).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Distinct sorted device brands, optionally constrained by selected type. */
export function deriveDeviceBrands(devices: readonly DeviceTemplate[], deviceType: string): string[] {
  const byType = deviceType ? devices.filter((device) => device.type === deviceType) : devices;
  const set = new Set(byType.map((device) => device.brand).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Applies board filters and returns sorted results (type, brand, model). */
export function filterAndSortBoards(
  boards: readonly BoardTemplate[],
  filters: BoardCatalogFilterValues
): BoardTemplate[] {
  let out = boards;
  if (filters.brand) out = out.filter((board) => board.brand === filters.brand);
  out = applyTextFilter(out, filters.text);
  out = applyDimensionFilters(out, filters.width, filters.depth);

  return [...out].sort((a, b) => {
    const byType = (a.type ?? "").localeCompare(b.type ?? "");
    if (byType !== 0) return byType;
    const byBrand = (a.brand ?? "").localeCompare(b.brand ?? "");
    if (byBrand !== 0) return byBrand;
    return (a.model ?? "").localeCompare(b.model ?? "");
  });
}

/** Applies device filters and returns sorted results (ordered type, brand, model). */
export function filterAndSortDevices(
  devices: readonly DeviceTemplate[],
  filters: DeviceCatalogFilterValues
): DeviceTemplate[] {
  let out = devices.filter((device) => {
    if (filters.brand && device.brand !== filters.brand) return false;
    if (filters.type && device.type !== filters.type) return false;
    return true;
  });

  out = applyTextFilter(out, filters.text);
  out = applyDimensionFilters(out, filters.width, filters.depth);

  return [...out].sort((a, b) => {
    const typeA = DEVICE_TYPE_ORDER.indexOf(a.type);
    const typeB = DEVICE_TYPE_ORDER.indexOf(b.type);
    const byType = (typeA === -1 ? 999 : typeA) - (typeB === -1 ? 999 : typeB);
    if (byType !== 0) return byType;
    const byBrand = (a.brand ?? "").localeCompare(b.brand ?? "");
    if (byBrand !== 0) return byBrand;
    return (a.model ?? "").localeCompare(b.model ?? "");
  });
}
