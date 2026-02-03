/** Context passed to a placement strategy for computing where to place new objects. */
export interface PlacementContext {
  canvasRect: DOMRect;
  pan: { x: number; y: number };
  zoom: number;
  catalogRect: DOMRect | undefined;
  boardMenuRect: DOMRect | undefined;
  /** Center of the browser viewport (e.g. window.innerWidth/2, window.innerHeight/2). Used so click-to-add places at visual center. */
  viewportCenter?: { x: number; y: number };
}

/** Strategy that returns canvas coordinates (x, y) for placing a new object. */
export type PlacementStrategy = (ctx: PlacementContext) => { x: number; y: number };

/** Center of viewport in canvas coords. Uses viewportCenter when provided (browser viewport center), else canvas element center. */
export const visibleViewportPlacement: PlacementStrategy = (ctx) => {
  const { canvasRect, pan, zoom, viewportCenter } = ctx;
  const centerScreenX = viewportCenter?.x ?? (canvasRect.left + canvasRect.right) / 2;
  const centerScreenY = viewportCenter?.y ?? (canvasRect.top + canvasRect.bottom) / 2;
  const canvasX = (centerScreenX - canvasRect.left - pan.x) / zoom;
  const canvasY = (centerScreenY - canvasRect.top - pan.y) / zoom;
  return { x: Math.round(canvasX), y: Math.round(canvasY) };
};
