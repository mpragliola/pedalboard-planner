import { useState, useCallback, useEffect, useRef } from 'react'
import type { CanvasObjectType } from '../types'

export function useObjectDrag(
  objects: CanvasObjectType[],
  setObjects: (action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]), saveToHistory?: boolean) => void,
  zoom: number,
  spaceDown: boolean
) {
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null)
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; objX: number; objY: number } | null>(null)
  const dragTargetIdsRef = useRef<Set<string>>(new Set())
  const hasPushedHistoryRef = useRef(false)

  const getObjectsToDrag = useCallback((): string[] => {
    const ids = dragTargetIdsRef.current
    return ids.size ? Array.from(ids) : []
  }, [])

  const handleObjectDragStart = useCallback((id: string, e: React.PointerEvent) => {
    if (e.button !== 0 || spaceDown) return
    if (dragTargetIdsRef.current.size > 0) return
    e.preventDefault()
    e.stopPropagation()
    const obj = objects.find((o) => o.id === id)
    if (!obj) return
    dragTargetIdsRef.current = new Set([id])
    setDraggingObjectId(id)
    dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, objX: obj.x, objY: obj.y }
    hasPushedHistoryRef.current = false
  }, [objects, spaceDown])

  const clearDragState = useCallback(() => {
    if (dragTargetIdsRef.current.size === 0) return
    dragTargetIdsRef.current = new Set()
    dragStartRef.current = null
    setDraggingObjectId(null)
    hasPushedHistoryRef.current = false
  }, [])

  const handleObjectPositionUpdate = useCallback((id: string, x: number, y: number, saveToHistory = false) => {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, x, y } : o)), saveToHistory)
  }, [setObjects])

  const handleObjectsPositionUpdate = useCallback(
    (updates: Array<{ id: string; x: number; y: number }>, saveToHistory = false) => {
      if (updates.length === 0) return
      setObjects((prev) => {
        const byId = new Map(updates.map((u) => [u.id, u]))
        return prev.map((o) => {
          const u = byId.get(o.id)
          return u ? { ...o, x: u.x, y: u.y } : o
        })
      }, saveToHistory)
    },
    [setObjects]
  )

  useEffect(() => {
    if (!draggingObjectId) return
    const handlePointerMove = (e: PointerEvent) => {
      const ids = getObjectsToDrag()
      if (ids.length === 0 || !dragStartRef.current) return

      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom
      const newX = dragStartRef.current.objX + dx
      const newY = dragStartRef.current.objY + dy

      // Push history once when movement actually starts
      const saveToHistory = !hasPushedHistoryRef.current
      if (saveToHistory) {
        hasPushedHistoryRef.current = true
      }

      if (ids.length === 1) {
        handleObjectPositionUpdate(ids[0], newX, newY, saveToHistory)
      } else {
        handleObjectsPositionUpdate(ids.map((id) => ({ id, x: newX, y: newY })), saveToHistory)
      }
    }
    const handlePointerUp = () => clearDragState()
    window.addEventListener('pointermove', handlePointerMove, { capture: true })
    window.addEventListener('pointerup', handlePointerUp, { capture: true })
    window.addEventListener('pointercancel', handlePointerUp, { capture: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, { capture: true })
      window.removeEventListener('pointerup', handlePointerUp, { capture: true })
      window.removeEventListener('pointercancel', handlePointerUp, { capture: true })
    }
  }, [
    draggingObjectId,
    zoom,
    getObjectsToDrag,
    clearDragState,
    handleObjectPositionUpdate,
    handleObjectsPositionUpdate,
    setObjects,
  ])

  return {
    draggingObjectId,
    handleObjectDragStart,
    clearDragState,
  }
}
