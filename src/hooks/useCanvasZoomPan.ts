import { useState, useCallback, useEffect, useRef } from 'react'
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '../constants'

export function useCanvasZoomPan() {
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [spaceDown, setSpaceDown] = useState(false)
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)

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
    const handleMouseMove = (e: MouseEvent) => {
      if (panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX
        const dy = e.clientY - panStartRef.current.mouseY
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        })
      }
    }
    const handleMouseUp = () => {
      setIsPanning(false)
      panStartRef.current = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning])

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault()
        setIsPanning(true)
        panStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, panX: pan.x, panY: pan.y }
      } else if (e.button === 0 && spaceDown) {
        e.preventDefault()
        setIsPanning(true)
        panStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, panX: pan.x, panY: pan.y }
      }
    },
    [spaceDown, pan.x, pan.y]
  )

  const tileSize = 2400 * zoom

  return {
    zoom,
    pan,
    zoomRef,
    panRef,
    canvasRef,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    zoomToward,
    setPan,
    handleCanvasMouseDown,
    tileSize,
  }
}
