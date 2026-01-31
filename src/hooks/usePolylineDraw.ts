import { useState, useCallback } from 'react'

export type Segment = { x1: number; y1: number; x2: number; y2: number }

export interface PolylineDrawState {
  segments: Segment[]
  segmentStart: { x: number; y: number } | null
  currentEnd: { x: number; y: number } | null
}

export interface PolylineDrawHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onDoubleClick: (e: React.MouseEvent) => void
}

export interface UsePolylineDrawResult extends PolylineDrawState, PolylineDrawHandlers {
  committedLength: number
  currentLength: number
  totalLength: number
  hasSegments: boolean
  hasPreview: boolean
}

const MIN_SEGMENT_LENGTH = 0.5

/**
 * Manages polyline drawing state (click + move): segments, current segment start/end,
 * and pointer handlers. Does not handle coordinate conversion or exit (ESC/double-click).
 */
export function usePolylineDraw(
  clientToCanvas: (clientX: number, clientY: number) => { x: number; y: number },
  onDoubleClickExit?: () => void
): UsePolylineDrawResult {
  const [segments, setSegments] = useState<Segment[]>([])
  const [segmentStart, setSegmentStart] = useState<{ x: number; y: number } | null>(null)
  const [currentEnd, setCurrentEnd] = useState<{ x: number; y: number } | null>(null)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      if ((e.nativeEvent as MouseEvent).detail === 2) {
        onDoubleClickExit?.()
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      const point = { x, y }
      if (!segmentStart) {
        setSegmentStart(point)
        setCurrentEnd(point)
      } else {
        const len = Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y)
        if (len > MIN_SEGMENT_LENGTH) {
          setSegments((prev) => [
            ...prev,
            { x1: segmentStart.x, y1: segmentStart.y, x2: point.x, y2: point.y },
          ])
        }
        setSegmentStart(point)
        setCurrentEnd(point)
      }
    },
    [clientToCanvas, segmentStart, onDoubleClickExit]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!segmentStart) return
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      setCurrentEnd({ x, y })
    },
    [clientToCanvas, segmentStart]
  )

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDoubleClickExit?.()
    },
    [onDoubleClickExit]
  )

  const committedLength = segments.reduce(
    (sum, s) => sum + Math.hypot(s.x2 - s.x1, s.y2 - s.y1),
    0
  )
  const currentLength =
    segmentStart && currentEnd
      ? Math.hypot(currentEnd.x - segmentStart.x, currentEnd.y - segmentStart.y)
      : 0
  const totalLength = committedLength + currentLength

  return {
    segments,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerMove,
    onDoubleClick,
    committedLength,
    currentLength,
    totalLength,
    hasSegments: segments.length > 0,
    hasPreview: segmentStart !== null && currentEnd !== null,
  }
}
