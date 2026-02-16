import type { ConnectorKind } from "../types";

/** Cable terminal colors: start (A) = light green, end (B) = light orange. Used on canvas dots and in Add/Edit cable modal. */
export const CABLE_TERMINAL_START_COLOR = "#9ee69e";
export const CABLE_TERMINAL_END_COLOR = "#ffb74d";

/** Cable color with display label. Colors are fixed hex values independent of OS theme. */
export interface CableColor {
  hex: string;
  label: string;
}

/** Predefined cable colors matching standard audio/guitar cable colors. Fixed hex values - not affected by OS dark/light settings. */
export const CABLE_COLORS: CableColor[] = [
  { hex: "#333333", label: "Dark Grey" },
  { hex: "#000000", label: "Black" },
  { hex: "#666666", label: "Grey" },
  { hex: "#CCCCCC", label: "Light Grey" },
  { hex: "#FFFFFF", label: "White" },
  { hex: "#8B7355", label: "Brown" },
  { hex: "#DC143C", label: "Red" },
  { hex: "#FF6B7A", label: "Light Red" },
  { hex: "#0066CC", label: "Blue" },
  { hex: "#00BFFF", label: "Light Blue" },
  { hex: "#008000", label: "Green" },
  { hex: "#00CC80", label: "Light Green" },
  { hex: "#FFD700", label: "Gold/Yellow" },
  { hex: "#FFA500", label: "Orange" },
  { hex: "#FF69B4", label: "Pink" },
  { hex: "#800080", label: "Purple" },
];

/** Hex color values for backwards compatibility. Derived from CABLE_COLORS. */
export const CABLE_COLOR_OPTIONS: string[] = CABLE_COLORS.map((c) => c.hex);

export interface CableConnectorTemplate {
  name: string;
  connectorA: ConnectorKind;
  connectorB: ConnectorKind;
}

/** One-tap templates that prefill endpoint connector kinds in Add/Edit Cable modal. */
export const CABLE_CONNECTOR_TEMPLATES: CableConnectorTemplate[] = [
  { name: "Mono jack", connectorA: "mono jack (TS)", connectorB: "mono jack (TS)" },
  { name: "Stereo jack", connectorA: "stereo jack (TRS)", connectorB: "stereo jack (TRS)" },
  { name: "XLR", connectorA: "XLR male", connectorB: "XLR female" },
];
