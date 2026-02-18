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

// History
export const HISTORY_DEPTH = 200;

// Zoom multiplier for wheel events
export const WHEEL_ZOOM_FACTOR = 0.002;
