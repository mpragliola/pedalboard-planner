import type { CanvasObjectType } from "./types";
import type { ConnectorKind, ConnectorLinkType } from "./types";

/** Base URL for static assets (e.g. '' or '/pedal/'). Use for image paths so they resolve from app root. */
export const BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : "/";

/** Connector kind to SVG image path. */
export const CONNECTOR_ICON_MAP: Record<ConnectorKind, string> = {
  "mono jack (TS)": `${BASE_URL}images/connectors/mono-jack-ts.svg`,
  "stereo jack (TRS)": `${BASE_URL}images/connectors/stereo-jack-trs.svg`,
  "MIDI (DIN)": `${BASE_URL}images/connectors/midi-din.svg`,
  "MIDI (TRS)": `${BASE_URL}images/connectors/midi-trs.svg`,
  "two mono jacks (TSx2)": `${BASE_URL}images/connectors/two-mono-jacks.svg`,
  "XLR male": `${BASE_URL}images/connectors/xlr-male.svg`,
  "XLR female": `${BASE_URL}images/connectors/xlr-female.svg`,
};
import type { DeviceType } from "./data/devices";

// Zoom constants
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.25;

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
export const MOVE_THRESHOLD_PX = 10;

// UI Layout constants
export const TOOLBAR_GAP_PX = 8;
export const TOOLBAR_HEIGHT_PX = 36;
export const TILE_SIZE_BASE = 1200;
export const DEFAULT_PLACEMENT_FALLBACK = { x: 120, y: 120 };

// History
export const HISTORY_DEPTH = 200;

// Zoom multiplier for wheel events
export const WHEEL_ZOOM_FACTOR = 0.002;

export const DEVICE_TYPE_ORDER: DeviceType[] = ["pedal", "multifx", "power unit", "controller"];
export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  pedal: "Pedals",
  multifx: "Multifx",
  "power unit": "Power units",
  controller: "Controllers",
};

export const initialObjects: CanvasObjectType[] = [];

/** Default fill color when a board or device has no image (and no custom color). */
export const DEFAULT_OBJECT_COLOR = "rgb(72, 72, 82)";

/** Connector link type options (audio, midi, expression). */
export const CONNECTOR_TYPE_OPTIONS: { value: ConnectorLinkType; label: string }[] = [
  { value: "audio", label: "Audio" },
  { value: "midi", label: "MIDI" },
  { value: "expression", label: "Expression" },
];

/** Physical connector kind options. */
export const CONNECTOR_KIND_OPTIONS: { value: ConnectorKind; label: string }[] = [
  { value: "mono jack (TS)", label: "Mono jack (TS)" },
  { value: "stereo jack (TRS)", label: "Stereo jack (TRS)" },
  { value: "MIDI (DIN)", label: "MIDI (DIN)" },
  { value: "MIDI (TRS)", label: "MIDI (TRS)" },
  { value: "two mono jacks (TSx2)", label: "Two mono jacks (TSx2)" },
  { value: "XLR male", label: "XLR male" },
  { value: "XLR female", label: "XLR female" },
];
