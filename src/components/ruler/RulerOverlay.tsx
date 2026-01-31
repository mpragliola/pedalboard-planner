import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import './RulerOverlay.css'

const MM_TO_IN = 1 / 25.4

function formatLength(mm: number, unit: 'mm' | 'in'): string {
  if (unit === 'in') {
    const inches = mm * MM_TO_IN
    return inches >= 0.01 ? `${inches.toFixed(2)} in` : `${(inches * 1000).toFixed(0)} mil`
  }
  return mm >= 0.1 ? `${mm.toFixed(1)} mm` : `${mm.toFixed(2)} mm`
}

export function RulerOverlay() {
  const { canvasRef, zoom, pan, unit, setRuler } = useApp()
  const [rect, setRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      dragStartRef.current = { x, y }
      setIsDragging(true)
      setRect({ x1: x, y1: y, x2: x, y2: y })
      overlayRef.current?.setPointerCapture(e.pointerId)
    },
    [clientToCanvas]
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
  const left = rect ? pan.x + Math.min(rect.x1, rect.x2) * zoom : 0
  const top = rect ? pan.y + Math.min(rect.y1, rect.y2) * zoom : 0
  const width = w * zoom
  const height = h * zoom
  const hasMeasure = w > 0 || h > 0
  const diagX1 = rect ? pan.x + rect.x1 * zoom : 0
  const diagY1 = rect ? pan.y + rect.y1 * zoom : 0
  const diagX2 = rect ? pan.x + rect.x2 * zoom : 0
  const diagY2 = rect ? pan.y + rect.y2 * zoom : 0

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
                x1={diagX1}
                y1={diagY1}
                x2={diagX2}
                y2={diagY2}
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
