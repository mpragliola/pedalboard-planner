import { useCallback } from 'react'
import { canvasToScreenPoint, clientToCanvasPoint, type Pan2D } from '../lib/canvasCoords'

/**
 * Converts between client/screen coordinates and canvas coordinates.
 * Canvas coords are in "world" units (1 mm = 1 px at zoom 1).
 */
export function useCanvasCoords(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  zoom: number,
  pan: Pan2D
) {
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const el = canvasRef.current
      if (!el) return { x: 0, y: 0 }
      const r = el.getBoundingClientRect()
      return clientToCanvasPoint({ x: clientX, y: clientY }, r, zoom, pan)
    },
    [canvasRef, pan.x, pan.y, zoom]
  )

  const toScreen = useCallback(
    (x: number, y: number) => canvasToScreenPoint(x, y, zoom, pan),
    [pan.x, pan.y, zoom]
  )

  return { clientToCanvas, toScreen }
}

