import { useCallback, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { useUi } from '../../context/UiContext'
import { buildRoundedPathD, DEFAULT_JOIN_RADIUS } from '../../lib/polylinePath'
import { formatLength } from '../../lib/rulerFormat'
import { useCanvasCoords } from '../../hooks/useCanvasCoords'
import { usePolylineDraw } from '../../hooks/usePolylineDraw'
import './RulerOverlay.scss'

export function LineRulerOverlay() {
  const { canvasRef, zoom, pan, unit } = useApp()
  const { setLineRuler } = useUi()
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
    onPointerUp,
    onDoubleClick,
    committedLength,
    totalLength,
    hasSegments,
    hasPreview,
  } = usePolylineDraw(clientToCanvas, exitMode)

  const lastTapRef = useRef<{ time: number; clientX: number; clientY: number } | null>(null)
  const DOUBLE_TAP_MS = 350
  const DOUBLE_TAP_PX = 50

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType !== 'touch') return
      const now = Date.now()
      const last = lastTapRef.current
      if (
        last &&
        now - last.time < DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - last.clientX, e.clientY - last.clientY) < DOUBLE_TAP_PX
      ) {
        lastTapRef.current = null
        e.preventDefault()
        e.stopPropagation()
        exitMode()
        return
      }
      onPointerDown(e)
      if (e.button === 0 || e.pointerType === 'touch') {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
    },
    [onPointerDown, exitMode]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      onPointerUp(e)
      if (e.button === 0 || e.pointerType === 'touch') {
        lastTapRef.current = { time: Date.now(), clientX: e.clientX, clientY: e.clientY }
      }
    },
    [onPointerUp]
  )

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

  const joinRadiusPx = DEFAULT_JOIN_RADIUS * zoom
  const committedPathD =
    segments.length > 0
      ? buildRoundedPathD(
          [toScreen(segments[0].x1, segments[0].y1), ...segments.map((s) => toScreen(s.x2, s.y2))],
          joinRadiusPx
        )
      : ''

  const showBothLengths = hasPreview && totalLength > committedLength + 0.01

  return (
    <div
      className="ruler-overlay line-ruler-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={handlePointerUp}
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
          data-no-canvas-zoom
          style={{
            left: popupCenter.x,
            top: popupCenter.y - 6,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="ruler-popup-row">
            <span>Length</span>
            <span>
              {showBothLengths
                ? `${formatLength(committedLength, unit)} (${formatLength(totalLength, unit)})`
                : formatLength(totalLength, unit)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
