import type { RangeFilter } from "../../hooks/useFilterState";
import type { SizeRange } from "./filters/SizeFilters";

/** Applies a range pair and keeps boundary values normalized as "no filter" (empty string). */
export function applyRangeUpdate(
  range: readonly [number, number],
  filter: RangeFilter,
  values: SizeRange
) {
  const [minValue, maxValue] = values;
  filter.setMin(minValue <= range[0] ? "" : String(minValue));
  filter.setMax(maxValue >= range[1] ? "" : String(maxValue));
}

/**
 * Named invariant helper:
 * - values are always clamped to available slider bounds
 * - returned tuple always satisfies min <= max
 */
export function clampToValidRange(values: SizeRange, bounds: readonly [number, number]): SizeRange {
  const [boundMin, boundMax] = bounds;
  const clampedA = Math.min(boundMax, Math.max(boundMin, values[0]));
  const clampedB = Math.min(boundMax, Math.max(boundMin, values[1]));
  return clampedA <= clampedB ? [clampedA, clampedB] : [clampedB, clampedA];
}
