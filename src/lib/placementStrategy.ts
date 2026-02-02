/** Context passed to a placement strategy for computing where to place new objects. */
export interface PlacementContext {
  canvasRect: DOMRect;
  pan: { x: number; y: number };
  zoom: number;
  catalogRect: DOMRect | undefined;
  boardMenuRect: DOMRect | undefined;
}

/** Strategy that returns canvas coordinates (x, y) for placing a new object. */
export type PlacementStrategy = (ctx: PlacementContext) => { x: number; y: number };

/** Absolute center of the canvas viewport (screen center). */
export const visibleViewportPlacement: PlacementStrategy = (ctx) => {
  const { canvasRect, pan, zoom } = ctx;
  const centerScreenX = (canvasRect.left + canvasRect.right) / 2;
  const centerScreenY = (canvasRect.top + canvasRect.bottom) / 2;
  const canvasX = (centerScreenX - canvasRect.left - pan.x) / zoom;
  const canvasY = (centerScreenY - canvasRect.top - pan.y) / zoom;
  return { x: Math.round(canvasX), y: Math.round(canvasY) };
};
