import { useState, useCallback, useEffect, useRef } from 'react'
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '../constants'

function dist(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function center(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
}

export interface UseCanvasZoomPanOptions {
  initialZoom?: number
  initialPan?: { x: number; y: number }
}

export function useCanvasZoomPan(options?: UseCanvasZoomPanOptions) {
  const [zoom, setZoom] = useState<number>(options?.initialZoom ?? 1)
  const [pan, setPan] = useState<{ x: number; y: number }>(options?.initialPan ?? { x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [spaceDown, setSpaceDown] = useState(false)
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number; pointerId: number } | null>(null)
  const pinchRef = useRef<{ initialDistance: number; initialZoom: number; initialPan: { x: number; y: number }; centerX: number; centerY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  const zoomLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ZOOM_LOCK_MS = 250

  const [isZooming, setIsZooming] = useState(false)

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])
  useEffect(() => {
    panRef.current = pan
  }, [pan])

  const zoomToward = useCallback((newZoom: number, pivotX: number, pivotY: number) => {
    const z = zoomRef.current
    const p = panRef.current
    const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom))
    const newPanX = pivotX - ((pivotX - p.x) * clampedZoom) / z
    const newPanY = pivotY - ((pivotY - p.y) * clampedZoom) / z
    setIsZooming(true)
    if (zoomLockTimeoutRef.current) clearTimeout(zoomLockTimeoutRef.current)
    zoomLockTimeoutRef.current = setTimeout(() => {
      zoomLockTimeoutRef.current = null
      setIsZooming(false)
    }, ZOOM_LOCK_MS)
    setZoom(clampedZoom)
    setPan({ x: newPanX, y: newPanY })
  }, [])

  const zoomIn = useCallback(() => {
    const el = canvasRef.current
    const centerX = el ? el.getBoundingClientRect().left + el.offsetWidth / 2 : window.innerWidth / 2
    const centerY = el ? el.getBoundingClientRect().top + el.offsetHeight / 2 : window.innerHeight / 2
    zoomToward(zoomRef.current + ZOOM_STEP, centerX, centerY)
  }, [zoomToward])

  const zoomOut = useCallback(() => {
    const el = canvasRef.current
    const centerX = el ? el.getBoundingClientRect().left + el.offsetWidth / 2 : window.innerWidth / 2
    const centerY = el ? el.getBoundingClientRect().top + el.offsetHeight / 2 : window.innerHeight / 2
    zoomToward(zoomRef.current - ZOOM_STEP, centerX, centerY)
  }, [zoomToward])

  const handleWheelZoom = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = -Math.sign(e.deltaY) * ZOOM_STEP
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current + delta))
    zoomToward(newZoom, e.clientX, e.clientY)
  }, [zoomToward])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheelZoom, { passive: false })
    return () => el.removeEventListener('wheel', handleWheelZoom)
  }, [handleWheelZoom])

  /* Pinch-to-zoom (touch) */
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        setIsPanning(false)
        panStartRef.current = null
        const c = center(e.touches[0], e.touches[1])
        pinchRef.current = {
          initialDistance: dist(e.touches[0], e.touches[1]),
          initialZoom: zoomRef.current,
          initialPan: { ...panRef.current },
          centerX: c.x,
          centerY: c.y,
        }
      }
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const d = dist(e.touches[0], e.touches[1])
        const scale = d / pinchRef.current.initialDistance
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchRef.current.initialZoom * scale))
        zoomToward(newZoom, pinchRef.current.centerX, pinchRef.current.centerY)
      }
    }
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null
    }
    el.addEventListener('touchstart', handleTouchStart, { passive: false })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [zoomToward])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpaceDown(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpaceDown(false)
        if (isPanning) {
          setIsPanning(false)
          panStartRef.current = null
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPanning])

  useEffect(() => {
    if (!isPanning) return
    const handlePointerMove = (e: PointerEvent) => {
      if (panStartRef.current && e.pointerId === panStartRef.current.pointerId) {
        const dx = e.clientX - panStartRef.current.mouseX
        const dy = e.clientY - panStartRef.current.mouseY
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        })
      }
    }
    const handlePointerUp = (e: PointerEvent) => {
      if (panStartRef.current && e.pointerId === panStartRef.current.pointerId) {
        setIsPanning(false)
        panStartRef.current = null
      }
    }
    window.addEventListener('pointermove', handlePointerMove, { capture: true })
    window.addEventListener('pointerup', handlePointerUp, { capture: true })
    window.addEventListener('pointercancel', handlePointerUp, { capture: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, { capture: true })
      window.removeEventListener('pointerup', handlePointerUp, { capture: true })
      window.removeEventListener('pointercancel', handlePointerUp, { capture: true })
    }
  }, [isPanning])

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const onObject = (e.target as Element).closest('.canvas-object-wrapper')
      const isTouch = e.pointerType === 'touch'
      const coarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
      const startPan =
        !onObject &&
        (e.button === 1 ||
          (e.button === 0 && spaceDown) ||
          (e.button === 0 && (isTouch || coarsePointer)))
      if (startPan) {
        e.preventDefault()
        setIsPanning(true)
        panStartRef.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          panX: pan.x,
          panY: pan.y,
          pointerId: e.pointerId,
        }
      }
    },
    [spaceDown, pan.x, pan.y]
  )

  const tileSize = 1200 * zoom

  return {
    zoom,
    pan,
    zoomRef,
    panRef,
    canvasRef,
    isPanning,
    spaceDown,
    isZooming,
    zoomIn,
    zoomOut,
    zoomToward,
    setPan,
    handleCanvasPointerDown,
    tileSize,
  }
}
