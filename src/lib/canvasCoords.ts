import type { Offset, Point } from "./vector";
export type RectOrigin = { left: number; top: number };

/** Converts pointer client coordinates into canvas/world coordinates. */
export function clientToCanvasPoint(client: Point, rect: RectOrigin, zoom: number, pan: Offset): Point {
  return {
    x: (client.x - rect.left - pan.x) / zoom,
    y: (client.y - rect.top - pan.y) / zoom,
  };
}

/** Converts canvas/world coordinates into screen coordinates in the canvas viewport. */
export function canvasToScreenPoint(point: Point, zoom: number, pan: Offset): Point {
  return {
    x: pan.x + point.x * zoom,
    y: pan.y + point.y * zoom,
  };
}
