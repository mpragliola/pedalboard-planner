import type { Point } from "./vector";

export type Pan2D = { x: number; y: number };
export type RectOrigin = { left: number; top: number };

/** Converts pointer client coordinates into canvas/world coordinates. */
export function clientToCanvasPoint(client: Point, rect: RectOrigin, zoom: number, pan: Pan2D): Point;
export function clientToCanvasPoint(
  clientX: number,
  clientY: number,
  rect: RectOrigin,
  zoom: number,
  pan: Pan2D
): Point;
export function clientToCanvasPoint(
  clientOrX: Point | number,
  clientYOrRect: number | RectOrigin,
  rectOrZoom: RectOrigin | number,
  zoomOrPan: number | Pan2D,
  panOpt?: Pan2D
): Point {
  if (typeof clientOrX === "number") {
    const clientX = clientOrX;
    const clientY = clientYOrRect as number;
    const rect = rectOrZoom as RectOrigin;
    const zoom = zoomOrPan as number;
    const pan = panOpt as Pan2D;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }
  const client = clientOrX as Point;
  const rect = clientYOrRect as RectOrigin;
  const zoom = rectOrZoom as number;
  const pan = zoomOrPan as Pan2D;
  return {
    x: (client.x - rect.left - pan.x) / zoom,
    y: (client.y - rect.top - pan.y) / zoom,
  };
}

/** Converts canvas/world coordinates into screen coordinates in the canvas viewport. */
export function canvasToScreenPoint(x: number, y: number, zoom: number, pan: Pan2D): Point {
  return {
    x: pan.x + x * zoom,
    y: pan.y + y * zoom,
  };
}
