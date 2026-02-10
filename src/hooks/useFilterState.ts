import { useState } from "react";

/** A single string filter value with a setter. */
export interface StringFilter {
  value: string;
  set: (v: string) => void;
}

export function useStringFilter(initial = ""): StringFilter {
  const [value, set] = useState(initial);
  return { value, set };
}

/** A min/max range filter (both stored as strings for input binding). */
export interface RangeFilter {
  min: string;
  max: string;
  setMin: (v: string) => void;
  setMax: (v: string) => void;
}

export function useRangeFilter(): RangeFilter {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  return { min, max, setMin, setMax };
}

/** True if any field in a StringFilter or RangeFilter is non-empty. */
export function isFilterActive(...filters: (StringFilter | RangeFilter)[]): boolean {
  return filters.some((f) =>
    "min" in f ? !!(f.min || f.max) : !!f.value
  );
}

/** Reset all provided filters to empty strings. */
export function resetFilters(...filters: (StringFilter | RangeFilter)[]): void {
  for (const f of filters) {
    if ("min" in f) {
      f.setMin("");
      f.setMax("");
    } else {
      f.set("");
    }
  }
}
