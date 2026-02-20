import type { CatalogMode, CatalogViewMode } from "./types";

export function imageBaseForCatalogMode(catalogMode: CatalogMode): string {
  return catalogMode === "boards" ? "images/boards/" : "images/devices/";
}

export function thumbSizesForCatalogViewMode(viewMode: CatalogViewMode): string {
  switch (viewMode) {
    case "list":
      return "36px";
    case "grid":
      return "48px";
    case "large":
      return "72px";
    case "xlarge":
      return "96px";
    case "text":
    default:
      return "1px";
  }
}

export function isCardCatalogViewMode(viewMode: CatalogViewMode): boolean {
  return viewMode === "grid" || viewMode === "large";
}
