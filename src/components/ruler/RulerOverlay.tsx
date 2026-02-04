import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useCanvasCoords } from '../../hooks/useCanvasCoords'
import { formatLength } from '../../lib/rulerFormat'
import './RulerOverlay.css'

export function RulerOverlay() {
  const { canvasRef, zoom, pan, unit, setRuler } = useApp()
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan)
  const [rect, setRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      // If we already have a committed rectangle (not drawing), next click exits ruler mode
      if (rect && !isDragging) {
        setRuler(() => false)
        return
      }
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      dragStartRef.current = { x, y }
      setIsDragging(true)
      setRect({ x1: x, y1: y, x2: x, y2: y })
      overlayRef.current?.setPointerCapture(e.pointerId)
    },
    [clientToCanvas, rect, isDragging, setRuler]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      setRect({
        x1: dragStartRef.current.x,
        y1: dragStartRef.current.y,
        x2: x,
        y2: y,
      })
    },
    [clientToCanvas]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      overlayRef.current?.releasePointerCapture(e.pointerId)
      setIsDragging(false)
      dragStartRef.current = null
    },
    []
  )

  useEffect(() => {
    if (!isDragging) return
    const handlePointerUpGlobal = (e: PointerEvent) => {
      if (e.button === 0) {
        setIsDragging(false)
        dragStartRef.current = null
      }
    }
    window.addEventListener('pointerup', handlePointerUpGlobal)
    return () => window.removeEventListener('pointerup', handlePointerUpGlobal)
  }, [isDragging])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRuler(() => false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setRuler])

  const w = rect ? Math.abs(rect.x2 - rect.x1) : 0
  const h = rect ? Math.abs(rect.y2 - rect.y1) : 0
  const diagonal = rect ? Math.hypot(w, h) : 0
  const screenMin = rect ? toScreen(Math.min(rect.x1, rect.x2), Math.min(rect.y1, rect.y2)) : { x: 0, y: 0 }
  const left = screenMin.x
  const top = screenMin.y
  const width = w * zoom
  const height = h * zoom
  const hasMeasure = w > 0 || h > 0
  const screenP1 = rect ? toScreen(rect.x1, rect.y1) : { x: 0, y: 0 }
  const screenP2 = rect ? toScreen(rect.x2, rect.y2) : { x: 0, y: 0 }

  return (
    <div
      ref={overlayRef}
      className="ruler-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {rect && (
        <>
          <div
            className="ruler-rect"
            style={{
              left,
              top,
              width: Math.max(width, 1),
              height: Math.max(height, 1),
            }}
          />
          {hasMeasure && (
            <svg
              className="ruler-diagonal"
              style={{ left: 0, top: 0 }}
            >
              <line
                x1={screenP1.x}
                y1={screenP1.y}
                x2={screenP2.x}
                y2={screenP2.y}
                stroke="#e67e22"
                strokeWidth="2"
              />
            </svg>
          )}
          {hasMeasure && (
            <div
              className="ruler-popup"
              style={{
                left: left + width / 2,
                top: top - 6,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="ruler-popup-row">
                <span>Width</span>
                <span>{formatLength(w, unit)}</span>
              </div>
              <div className="ruler-popup-row">
                <span>Depth</span>
                <span>{formatLength(h, unit)}</span>
              </div>
              <div className="ruler-popup-row">
                <span>Diagonal</span>
                <span>{formatLength(diagonal, unit)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
