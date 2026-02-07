/** Strategies for choosing initial placement positions on the canvas. */
import { vec2Add, vec2Scale, vec2Sub, type Vec2 } from "./vector";

/** Context passed to a placement strategy for computing where to place new objects. */
export interface PlacementContext {
  canvasRect: DOMRect;
  pan: Vec2;
  zoom: number;
  /** Center of the browser viewport (e.g. window.innerWidth/2, window.innerHeight/2). Used so click-to-add places at visual center. */
  viewportCenter?: Vec2;
}

/** Strategy that returns canvas coordinates (x, y) for placing a new object. */
export type PlacementStrategy = (ctx: PlacementContext) => Vec2;

function rectCenter(rect: DOMRect): Vec2 {
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/** Center of viewport in canvas coords. Uses viewportCenter when provided (browser viewport center), else canvas element center. */
export const visibleViewportPlacement: PlacementStrategy = (ctx) => {
  const { canvasRect, pan, zoom, viewportCenter } = ctx;
  const centerScreen = viewportCenter ?? rectCenter(canvasRect);
  const canvasScreenOrigin = vec2Add({ x: canvasRect.left, y: canvasRect.top }, pan);
  const canvasPoint = vec2Scale(vec2Sub(centerScreen, canvasScreenOrigin), 1 / zoom);
  return { x: Math.round(canvasPoint.x), y: Math.round(canvasPoint.y) };
};
