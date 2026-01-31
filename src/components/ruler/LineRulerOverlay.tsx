import { useCallback, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { buildRoundedPathD, DEFAULT_JOIN_RADIUS } from '../../lib/polylinePath'
import { formatLength } from '../../lib/rulerFormat'
import { useCanvasCoords } from '../../hooks/useCanvasCoords'
import { usePolylineDraw } from '../../hooks/usePolylineDraw'
import './RulerOverlay.css'

export function LineRulerOverlay() {
  const { canvasRef, zoom, pan, unit, setLineRuler } = useApp()
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan)

  const exitMode = useCallback(() => {
    setLineRuler(() => false)
  }, [setLineRuler])

  const {
    segments,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerMove,
    onDoubleClick,
    totalLength,
    hasSegments,
    hasPreview,
  } = usePolylineDraw(clientToCanvas, exitMode)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitMode()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [exitMode])

  const popupCenter = (() => {
    if (hasPreview && segmentStart && currentEnd) {
      return {
        x: pan.x + ((segmentStart.x + currentEnd.x) / 2) * zoom,
        y: pan.y + ((segmentStart.y + currentEnd.y) / 2) * zoom,
      }
    }
    if (segments.length > 0) {
      const last = segments[segments.length - 1]
      return {
        x: pan.x + last.x2 * zoom,
        y: pan.y + last.y2 * zoom,
      }
    }
    return null
  })()

  const committedPathD =
    segments.length > 0
      ? buildRoundedPathD(
          [toScreen(segments[0].x1, segments[0].y1), ...segments.map((s) => toScreen(s.x2, s.y2))],
          DEFAULT_JOIN_RADIUS
        )
      : ''

  return (
    <div
      className="ruler-overlay line-ruler-overlay"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onDoubleClick}
    >
      <svg className="ruler-diagonal" style={{ left: 0, top: 0 }}>
        {committedPathD && (
          <path
            d={committedPathD}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {hasPreview && segmentStart && currentEnd && (() => {
          const p1 = toScreen(segmentStart.x, segmentStart.y)
          const p2 = toScreen(currentEnd.x, currentEnd.y)
          return (
            <path
              d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
          )
        })()}
      </svg>
      {((hasSegments || hasPreview) && popupCenter && totalLength > 0) && (
        <div
          className="ruler-popup"
          style={{
            left: popupCenter.x,
            top: popupCenter.y - 6,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="ruler-popup-row">
            <span>Length</span>
            <span>{formatLength(totalLength, unit)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
