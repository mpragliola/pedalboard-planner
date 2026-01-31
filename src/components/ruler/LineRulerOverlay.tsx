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

type Segment = { x1: number; y1: number; x2: number; y2: number }

export function LineRulerOverlay() {
  const { canvasRef, zoom, pan, unit, setLineRuler } = useApp()
  const [segments, setSegments] = useState<Segment[]>([])
  const [currentEnd, setCurrentEnd] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const currentEndRef = useRef<{ x: number; y: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const exitMode = useCallback(() => {
    setLineRuler(() => false)
  }, [setLineRuler])

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
      const start = segments.length > 0
        ? { x: segments[segments.length - 1].x2, y: segments[segments.length - 1].y2 }
        : { x, y }
      dragStartRef.current = start
      currentEndRef.current = { x, y }
      setCurrentEnd({ x, y })
      setIsDragging(true)
      overlayRef.current?.setPointerCapture(e.pointerId)
    },
    [clientToCanvas, segments]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      currentEndRef.current = { x, y }
      setCurrentEnd({ x, y })
    },
    [clientToCanvas]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      overlayRef.current?.releasePointerCapture(e.pointerId)
      const end = currentEndRef.current
      if (dragStartRef.current && end) {
        const start = dragStartRef.current
        const len = Math.hypot(end.x - start.x, end.y - start.y)
        if (len > 0.5) {
          setSegments((prev) => [...prev, { x1: start.x, y1: start.y, x2: end.x, y2: end.y }])
        }
      }
      dragStartRef.current = null
      currentEndRef.current = null
      setCurrentEnd(null)
      setIsDragging(false)
    },
    []
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      exitMode()
    },
    [exitMode]
  )

  useEffect(() => {
    if (!isDragging) return
    const handlePointerUpGlobal = (e: PointerEvent) => {
      if (e.button === 0) {
        const end = currentEndRef.current
        if (dragStartRef.current && end) {
          const start = dragStartRef.current
          const len = Math.hypot(end.x - start.x, end.y - start.y)
          if (len > 0.5) {
            setSegments((prev) => [...prev, { x1: start.x, y1: start.y, x2: end.x, y2: end.y }])
          }
        }
        dragStartRef.current = null
        currentEndRef.current = null
        setCurrentEnd(null)
        setIsDragging(false)
      }
    }
    window.addEventListener('pointerup', handlePointerUpGlobal)
    return () => window.removeEventListener('pointerup', handlePointerUpGlobal)
  }, [isDragging])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitMode()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [exitMode])

  const committedLength = segments.reduce((sum, s) => sum + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0)
  const currentLength =
    dragStartRef.current && currentEnd
      ? Math.hypot(currentEnd.x - dragStartRef.current.x, currentEnd.y - dragStartRef.current.y)
      : 0
  const totalLength = committedLength + currentLength

  const hasSegments = segments.length > 0

  const toScreen = (x: number, y: number) => ({
    x: pan.x + x * zoom,
    y: pan.y + y * zoom,
  })

  const popupCenter = (() => {
    if (isDragging && dragStartRef.current && currentEnd) {
      const start = dragStartRef.current
      return {
        x: pan.x + (start.x + currentEnd.x) / 2 * zoom,
        y: pan.y + (start.y + currentEnd.y) / 2 * zoom,
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

  return (
    <div
      ref={overlayRef}
      className="ruler-overlay line-ruler-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <svg className="ruler-diagonal" style={{ left: 0, top: 0 }}>
        {segments.map((s, i) => {
          const p1 = toScreen(s.x1, s.y1)
          const p2 = toScreen(s.x2, s.y2)
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#22c55e"
              strokeWidth="2"
            />
          )
        })}
        {dragStartRef.current && currentEnd && (
          <line
            x1={toScreen(dragStartRef.current.x, dragStartRef.current.y).x}
            y1={toScreen(dragStartRef.current.x, dragStartRef.current.y).y}
            x2={toScreen(currentEnd.x, currentEnd.y).x}
            y2={toScreen(currentEnd.x, currentEnd.y).y}
            stroke="#22c55e"
            strokeWidth="2"
          />
        )}
      </svg>
      {((hasSegments || isDragging) && popupCenter && totalLength > 0) && (
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
