import type { CanvasObjectType } from "../types";

/** Initial empty board payload used across app boot/reset flows. */
export const initialObjects: CanvasObjectType[] = [];

/** Default fill color when a board or device has no image (and no custom color). */
export const DEFAULT_OBJECT_COLOR = "rgb(72, 72, 82)";
