import type { CanvasObjectType } from "./types";
import type { ConnectorKind } from "./types";
import type { DeviceType } from "./data/devices";

/** Base URL for static assets (e.g. '' or '/pedal/'). Use for image paths so they resolve from app root. */
export const BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : "/";

/** Connector kind to SVG image path. */
export const CONNECTOR_ICON_MAP: Record<ConnectorKind, string> = {
  "mono jack (TS)": `${BASE_URL}images/connectors/ts.svg`,
  "mono jack (TS mini)": `${BASE_URL}images/connectors/ts-mini.svg`,
  "stereo jack (TRS)": `${BASE_URL}images/connectors/trs.svg`,
  "stereo jack (TRS mini)": `${BASE_URL}images/connectors/trs-mini.svg`,
  "MIDI (DIN)": `${BASE_URL}images/connectors/MIDI-male.svg`,
  "MIDI (DIN female)": `${BASE_URL}images/connectors/MIDI-female.svg`,
  "MIDI (TRS)": `${BASE_URL}images/connectors/trs-mini.svg`,
  "two mono jacks (TSx2)": `${BASE_URL}images/connectors/2ts.svg`,
  "XLR male": `${BASE_URL}images/connectors/xlr_male.svg`,
  "XLR female": `${BASE_URL}images/connectors/xlr_female.svg`,
  Ethernet: `${BASE_URL}images/connectors/ethernet.svg`,
};

// Zoom constants
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.25;
/** Threshold for distinguishing pinch-to-zoom from two-finger panning. Ratio < this or > 1/this = pinch. */
export const PINCH_DETECTION_THRESHOLD = 0.95;

/** Scale: board/device template dimensions are in mm; convert to px for canvas. 1 mm = 1 px. */
export const MM_TO_PX = 1;

// Timing constants (ms)
export const LONG_PRESS_MS = 400;
export const WHEEL_PIVOT_MS = 120;
export const WHEEL_THROTTLE_MS = 50;
export const WHEEL_TRANSITION_MS = 250;
export const DEBOUNCE_SAVE_MS = 400;

// Drag thresholds (px)
export const DRAG_THRESHOLD_PX = 6;
/** Max movement during long-press before cancelling (scroll vs hold). Higher on mobile for finger drift. */
export const MOVE_THRESHOLD_PX = 20;

/** Cable terminal colors: start (A) = light green, end (B) = light orange. Used on canvas dots and in Add/Edit cable modal. */
export const CABLE_TERMINAL_START_COLOR = "#9ee69e";
export const CABLE_TERMINAL_END_COLOR = "#ffb74d";

/** Cable color with display label. Colors are fixed hex values independent of OS theme. */
export interface CableColor {
  hex: string;
  label: string;
}

/** Predefined cable colors matching standard audio/guitar cable colors. Fixed hex values – not affected by OS dark/light settings. */
export const CABLE_COLORS: CableColor[] = [
  { hex: "#000000", label: "Black" },
  { hex: "#333333", label: "Dark Grey" },
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

// UI Layout constants
export const TOOLBAR_GAP_PX = 8;
export const TOOLBAR_HEIGHT_PX = 36;
export const TILE_SIZE_BASE = 1200;
export const DEFAULT_PLACEMENT_FALLBACK = { x: 120, y: 120 };

// History
export const HISTORY_DEPTH = 200;

// Zoom multiplier for wheel events
export const WHEEL_ZOOM_FACTOR = 0.002;

export const DEVICE_TYPE_ORDER: DeviceType[] = [
  "pedal",
  "multifx",
  "expression",
  "volume",
  "power",
  "controller",
  "wireless",
  "loopswitcher",
];
export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  pedal: "Pedals",
  multifx: "Multifx",
  expression: "Expression pedal",
  volume: "Volume pedal",
  power: "Power units",
  controller: "Controllers",
  wireless: "Wireless systems",
  loopswitcher: "Loop switchers",
};

export const initialObjects: CanvasObjectType[] = [];

/** Default fill color when a board or device has no image (and no custom color). */
export const DEFAULT_OBJECT_COLOR = "rgb(72, 72, 82)";

/** Predefined connector name options (endpoint labels: Input, Output, etc.). */
export const CONNECTOR_NAME_OPTIONS: string[] = [
  "Input",
  "In L",
  "In R",
  "MIDI In",
  "MIDI Out",
  "MIDI Thru",
  "MIDI Out/thru",
  "Exp In",
  "Output",
  "Out L",
  "Out R",
  "Send",
  "Send 1",
  "Send 2",
  "Return",
  "Return 1",
  "Return 2",
];

/** Physical connector kind options. */
export const CONNECTOR_KIND_OPTIONS: { value: ConnectorKind; label: string }[] = [
  { value: "mono jack (TS)", label: "Mono jack (TS)" },
  { value: "mono jack (TS mini)", label: "Mono jack (TS mini)" },
  { value: "stereo jack (TRS)", label: "Stereo jack (TRS)" },
  { value: "stereo jack (TRS mini)", label: "Stereo jack (TRS mini)" },
  { value: "MIDI (DIN)", label: "MIDI (DIN)" },
  { value: "MIDI (DIN female)", label: "MIDI (DIN female)" },
  { value: "MIDI (TRS)", label: "MIDI (TRS)" },
  { value: "two mono jacks (TSx2)", label: "Two mono jacks (TSx2)" },
  { value: "XLR male", label: "XLR male" },
  { value: "XLR female", label: "XLR female" },
  { value: "Ethernet", label: "Ethernet" },
];
