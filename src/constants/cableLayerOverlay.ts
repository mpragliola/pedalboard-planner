/** Current in-progress cable appearance (screen-space drawing). */
export const CABLE_LAYER_CURRENT_CABLE_STROKE = "#000";
export const CABLE_LAYER_CURRENT_CABLE_OPACITY = 0.5;
/** Dash/gap scale relative to stroke width so dashes stay visible at any zoom. */
export const CABLE_LAYER_CURRENT_CABLE_DASH_SCALE = 1;
export const CABLE_LAYER_CURRENT_CABLE_GAP_SCALE = 2;

/** Overlay cable geometry and interaction thresholds. */
export const CABLE_LAYER_STROKE_WIDTH_MM = 5;
export const CABLE_LAYER_ENDPOINT_DOT_RADIUS_PX = 5;
export const CABLE_LAYER_ENDPOINT_DOT_STROKE = "rgba(0, 0, 0, 0.25)";
export const CABLE_LAYER_ENDPOINT_DOT_STROKE_WIDTH_PX = 1;
export const CABLE_LAYER_LENGTH_COMPARE_EPSILON_MM = 0.01;
export const CABLE_LAYER_LENGTH_POPUP_Y_OFFSET_PX = 6;
export const CABLE_LAYER_DOUBLE_TAP_MS = 350;
export const CABLE_LAYER_DOUBLE_TAP_MAX_DISTANCE_PX = 50;

/** Overlay DOM selectors used for hit-testing while drawing. */
export const CABLE_LAYER_ACTIONS_SELECTOR = ".cable-layer-actions";
export const CABLE_LAYER_ADD_BUTTON_SELECTOR = ".cable-layer-add-btn";
