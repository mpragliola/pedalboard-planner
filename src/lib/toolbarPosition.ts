import type { Point } from "./vector";

export interface ToolbarVerticalBounds {
  minY: number;
  maxY: number;
}

export interface ToolbarPositionOptions {
  gapPx: number;
  toolbarHeightPx: number;
  /** Minimum safe top coordinate before we flip below the anchor/bounds. */
  minTopPx?: number;
}

/**
 * Shared toolbar positioning algorithm used by selection and cable toolbars:
 * 1) place above anchor/bounds by default
 * 2) if too close to top edge, flip below
 */
export function computeToolbarPosition(
  anchor: Point,
  bounds: ToolbarVerticalBounds | null | undefined,
  options: ToolbarPositionOptions
): { left: number; top: number } {
  const { gapPx, toolbarHeightPx, minTopPx = toolbarHeightPx } = options;
  const resolvedBounds = bounds ?? { minY: anchor.y, maxY: anchor.y };

  let top = resolvedBounds.minY - gapPx - toolbarHeightPx;
  if (top < minTopPx) {
    top = resolvedBounds.maxY + gapPx;
  }

  return {
    left: anchor.x,
    top,
  };
}

