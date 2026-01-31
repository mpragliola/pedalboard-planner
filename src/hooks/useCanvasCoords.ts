import { useCallback } from 'react'

/**
 * Converts between client/screen coordinates and canvas coordinates.
 * Canvas coords are in "world" units (1 mm = 1 px at zoom 1).
 */
export function useCanvasCoords(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  zoom: number,
  pan: { x: number; y: number }
) {
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const el = canvasRef.current
      if (!el) return { x: 0, y: 0 }
      const r = el.getBoundingClientRect()
      return {
        x: (clientX - r.left - pan.x) / zoom,
        y: (clientY - r.top - pan.y) / zoom,
      }
    },
    [canvasRef, pan.x, pan.y, zoom]
  )

  const toScreen = useCallback(
    (x: number, y: number) => ({
      x: pan.x + x * zoom,
      y: pan.y + y * zoom,
    }),
    [pan.x, pan.y, zoom]
  )

  return { clientToCanvas, toScreen }
}
