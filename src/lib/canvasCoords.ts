import type { Point } from "./vector";

export type Pan2D = { x: number; y: number };
export type RectOrigin = { left: number; top: number };

type ClientToCanvasArgs = [client: Point, rect: RectOrigin, zoom: number, pan: Pan2D]
  | [clientX: number, clientY: number, rect: RectOrigin, zoom: number, pan: Pan2D];

/** Converts pointer client coordinates into canvas/world coordinates. */
export function clientToCanvasPoint(...args: ClientToCanvasArgs): Point {
  if (typeof args[0] === "number") {
    const [clientX, clientY, rect, zoom, pan] = args;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }

  const [client, rect, zoom, pan] = args;
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
