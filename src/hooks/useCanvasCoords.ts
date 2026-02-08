import { useCallback } from "react";
import { canvasToScreenPoint, clientToCanvasPoint } from "../lib/canvasCoords";
import type { Offset, Point } from "../lib/vector";

/**
 * Converts between client/screen coordinates and canvas coordinates.
 * Canvas coords are in "world" units (1 mm = 1 px at zoom 1).
 */
export function useCanvasCoords(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  zoom: number,
  pan: Offset
) {
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number): Point => {
      const el = canvasRef.current
      if (!el) return { x: 0, y: 0 }
      const r = el.getBoundingClientRect()
      return clientToCanvasPoint({ x: clientX, y: clientY }, r, zoom, pan)
    },
    [canvasRef, pan.x, pan.y, zoom]
  )

  const toScreen = useCallback(
    (x: number, y: number): Point => canvasToScreenPoint({ x, y }, zoom, pan),
    [pan.x, pan.y, zoom]
  )

  return { clientToCanvas, toScreen }
}

