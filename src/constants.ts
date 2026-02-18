/**
 * Backward-compatible constants façade.
 * Domain-specific constants now live in `src/constants/*`.
 */
export { BASE_URL, FEATURE_MINI3D_AUTOROTATE } from "./constants/runtime";
export { CONNECTOR_ICON_MAP, CONNECTOR_NAME_OPTIONS, CONNECTOR_KIND_OPTIONS } from "./constants/connectors";
export {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  PINCH_DETECTION_THRESHOLD,
  MM_TO_PX,
  LONG_PRESS_MS,
  WHEEL_PIVOT_MS,
  WHEEL_THROTTLE_MS,
  WHEEL_TRANSITION_MS,
  DEBOUNCE_SAVE_MS,
  DRAG_THRESHOLD_PX,
  MOVE_THRESHOLD_PX,
  HISTORY_DEPTH,
  WHEEL_ZOOM_FACTOR,
} from "./constants/interaction";
export { TOOLBAR_GAP_PX, TOOLBAR_HEIGHT_PX, TILE_SIZE_BASE, DEFAULT_PLACEMENT_FALLBACK } from "./constants/layout";
export { DEVICE_TYPE_ORDER, DEVICE_TYPE_LABEL } from "./constants/catalog";
export { initialObjects, DEFAULT_OBJECT_COLOR } from "./constants/defaults";

// Cable constants live in their own module; re-export here for compatibility.
export {
  CABLE_TERMINAL_START_COLOR,
  CABLE_TERMINAL_END_COLOR,
  CABLE_COLORS,
  CABLE_COLOR_OPTIONS,
} from "./constants/cables";
export type { CableColor } from "./constants/cables";
