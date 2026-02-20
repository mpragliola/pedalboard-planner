import type { DeviceType } from "../../../data/devices";

export type CatalogMode = "boards" | "devices";
export type CatalogViewMode = "text" | "list" | "grid" | "large" | "xlarge";

export interface CatalogListOption {
  id: string;
  name: string;
  image?: string | null;
  widthMm?: number;
  depthMm?: number;
  /** Color for placeholder when no image */
  color?: string;
}

export interface CatalogListGroupOption extends CatalogListOption {
  type: string;
}

export interface CatalogListGroup {
  deviceType?: DeviceType;
  label: string;
  options: CatalogListGroupOption[];
}
