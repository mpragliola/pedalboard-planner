/** Cable path render geometry and interactions (canvas units unless suffix indicates otherwise). */
export const CABLE_PATHS_STROKE_WIDTH_MM = 5;
/** Extra stroke width for selected cable halo (mm), so halo = stroke + 2 * extra. */
export const CABLE_PATHS_HALO_EXTRA_MM = 4;
export const CABLE_PATHS_SELECTED_CABLE_HALO_COLOR = "rgba(10, 132, 255, 0.7)";
export const CABLE_PATHS_ENDPOINT_DOT_RADIUS_MM = 4;
export const CABLE_PATHS_ENDPOINT_DOT_STROKE = "rgba(0, 0, 0, 0.25)";
export const CABLE_PATHS_ENDPOINT_DOT_STROKE_WIDTH_MM = 1;
/** Canvas-space SVG extent (covers -half..half) so cables stay visible when panning. */
export const CABLE_PATHS_CANVAS_HALF = 2500;
export const CABLE_PATHS_CANVAS_SIZE = CABLE_PATHS_CANVAS_HALF * 2;
export const CABLE_PATHS_Z_INDEX = 1000;

/** Hit area stroke width (mm) – invisible path for easier clicking. */
export const CABLE_PATHS_HIT_STROKE_MM = 16;
export const CABLE_PATHS_HANDLE_REMOVE_PRESS_MS = 600;
export const CABLE_PATHS_HANDLE_DRAG_THRESHOLD_PX = 4;
export const CABLE_PATHS_DOUBLE_TAP_TIME_WINDOW_MS = 320;
export const CABLE_PATHS_DOUBLE_TAP_MAX_DISTANCE_PX = 28;
export const CABLE_PATHS_INSERT_FLASH_RADIUS_MM = 6;
export const CABLE_PATHS_INSERT_FLASH_DURATION_MS = 300;
export const CABLE_PATHS_HANDLE_HALO_RADIUS_MM = 7;
export const CABLE_PATHS_HANDLE_DOT_RADIUS_MM = 4;
export const CABLE_PATHS_MID_HANDLE_FILL = "rgba(255, 255, 255, 0.9)";
export const CABLE_PATHS_DOUBLE_CLICK_DETAIL_THRESHOLD = 2;
export const CABLE_PATHS_MIN_SEGMENT_LENGTH = 1e-6;

/** Label metrics used for endpoint label + connector icon placement (canvas mm units). */
export const CABLE_PATHS_LABEL_FONT_SIZE_MM = 6;
export const CABLE_PATHS_LABEL_TEXT_LINE_HEIGHT_MM = 7;
export const CABLE_PATHS_LABEL_TEXT_CHAR_WIDTH_MM = CABLE_PATHS_LABEL_FONT_SIZE_MM * 0.55;
export const CABLE_PATHS_LABEL_TEXT_MIN_WIDTH_MM = 10;
/** Connector icon size rendered beneath endpoint labels (canvas mm units). */
export const CABLE_PATHS_LABEL_ICON_SIZE_MM = 22;
/** Vertical gap between label text block and icon (canvas mm units). */
export const CABLE_PATHS_LABEL_ICON_GAP_MM = 3;
/** Minimum clearance from terminal point to the nearest point of label+icon bounds. */
export const CABLE_PATHS_LABEL_TERMINAL_CLEARANCE_MM = 5;
