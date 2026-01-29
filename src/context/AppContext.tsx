import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import { BOARD_TEMPLATES } from '../data/boards'
import { DEVICE_TEMPLATES } from '../data/devices'
import { initialObjects } from '../constants'
import { createObjectFromBoardTemplate, createObjectFromDeviceTemplate } from '../lib/templateHelpers'
import { useCanvasZoomPan } from '../hooks/useCanvasZoomPan'
import { useObjectDrag } from '../hooks/useObjectDrag'
import { useBoardDeviceFilters } from '../hooks/useBoardDeviceFilters'
import { useHistory } from '../hooks/useHistory'
import type { CanvasObjectType } from '../types'

type CatalogMode = 'boards' | 'devices'

interface AppContextValue {
  // Refs
  canvasRef: React.RefObject<HTMLDivElement>
  dropdownPanelRef: React.RefObject<HTMLDivElement>
  // Canvas / zoom
  zoom: number
  pan: { x: number; y: number }
  tileSize: number
  showGrid: boolean
  setShowGrid: (fn: (v: boolean) => boolean) => void
  unit: 'mm' | 'in'
  setUnit: (u: 'mm' | 'in') => void
  isPanning: boolean
  spaceDown: boolean
  zoomIn: () => void
  zoomOut: () => void
  handleCanvasMouseDown: (e: React.MouseEvent) => void
  // Objects
  objects: CanvasObjectType[]
  setObjects: (action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]), saveToHistory?: boolean) => void
  selectedObjectIds: string[]
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>
  imageFailedIds: Set<string>
  draggingObjectId: string | null
  onImageError: (id: string) => void
  onObjectPointerDown: (id: string, e: React.PointerEvent) => void
  onDragEnd: () => void
  onDeleteObject: (id: string) => void
  onRotateObject: (id: string) => void
  onSendToBack: (id: string) => void
  // History
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  // Catalog
  catalogMode: CatalogMode
  setCatalogMode: (mode: CatalogMode) => void
  filters: ReturnType<typeof useBoardDeviceFilters>
  onBoardSelect: (templateId: string) => void
  onDeviceSelect: (templateId: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    state: objects,
    setState: setObjects,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<CanvasObjectType[]>(initialObjects, 200)

  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set())
  const [showGrid, setShowGrid] = useState(false)
  const [unit, setUnit] = useState<'mm' | 'in'>('mm')
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('boards')
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([])
  const dropdownPanelRef = useRef<HTMLDivElement>(null)

  const {
    zoom,
    pan,
    canvasRef,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    handleCanvasMouseDown: canvasPanMouseDown,
    tileSize,
  } = useCanvasZoomPan()

  const { draggingObjectId, handleObjectDragStart, clearDragState } = useObjectDrag(
    objects,
    setObjects,
    zoom,
    spaceDown
  )

  const filters = useBoardDeviceFilters()
  const { setSelectedBoard, setSelectedDevice } = filters

  const handleObjectPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      setSelectedObjectIds([id])
      handleObjectDragStart(id, e)
    },
    [handleObjectDragStart]
  )

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && !spaceDown && !(e.target as Element).closest('.canvas-object-wrapper')) {
        setSelectedObjectIds([])
      }
      canvasPanMouseDown(e)
    },
    [spaceDown, canvasPanMouseDown]
  )

  const handleImageError = useCallback((id: string) => {
    setImageFailedIds((prev) => new Set(prev).add(id))
  }, [])

  const getPlacementBesideDropdown = useCallback((): { x: number; y: number } => {
    const dropdownEl = dropdownPanelRef.current
    const canvasEl = canvasRef.current
    if (!dropdownEl || !canvasEl) return { x: 120, y: 120 }
    const dropdownRect = dropdownEl.getBoundingClientRect()
    const canvasRect = canvasEl.getBoundingClientRect()
    const gap = 16
    const canvasX = (dropdownRect.right + gap - canvasRect.left - pan.x) / zoom
    const canvasY = (dropdownRect.top + dropdownRect.height / 2 - canvasRect.top - pan.y) / zoom
    return { x: Math.round(canvasX), y: Math.round(canvasY) }
  }, [pan.x, pan.y, zoom, canvasRef])

  const handleBoardSelect = useCallback(
    (templateId: string) => {
      const id = templateId?.trim()
      if (!id) return
      const template = BOARD_TEMPLATES.find((t) => t.id === id)
      if (!template) return
      setSelectedBoard(id)
      const { x, y } = getPlacementBesideDropdown()
      const newObj = createObjectFromBoardTemplate(template, x, y)
      setObjects((prev) => [...prev, newObj])
    },
    [setSelectedBoard, getPlacementBesideDropdown, setObjects]
  )

  const handleDeviceSelect = useCallback(
    (templateId: string) => {
      const id = templateId?.trim()
      if (!id) return
      const template = DEVICE_TEMPLATES.find((t) => t.id === id)
      if (!template) return
      setSelectedDevice(id)
      const { x, y } = getPlacementBesideDropdown()
      const newObj = createObjectFromDeviceTemplate(template, x, y)
      setObjects((prev) => [...prev, newObj])
    },
    [setSelectedDevice, getPlacementBesideDropdown, setObjects]
  )

  const handleDeleteObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id))
    setSelectedObjectIds((prev) => prev.filter((sid) => sid !== id))
  }, [setObjects])

  const handleRotateObject = useCallback((id: string) => {
    setObjects((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, rotation: ((o.rotation ?? 0) + 90) % 360 } : o
      )
    )
  }, [setObjects])

  const handleSendToBack = useCallback((id: string) => {
    setObjects((prev) => {
      const i = prev.findIndex((o) => o.id === id)
      if (i <= 0) return prev
      const obj = prev[i]
      const next = prev.slice(0, i).concat(prev.slice(i + 1))
      return [obj, ...next]
    })
  }, [setObjects])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const value: AppContextValue = {
    canvasRef,
    dropdownPanelRef,
    zoom,
    pan,
    tileSize,
    showGrid,
    setShowGrid,
    unit,
    setUnit,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    handleCanvasMouseDown,
    objects,
    setObjects,
    selectedObjectIds,
    setSelectedObjectIds,
    imageFailedIds,
    draggingObjectId,
    onImageError: handleImageError,
    onObjectPointerDown: handleObjectPointerDown,
    onDragEnd: clearDragState,
    onDeleteObject: handleDeleteObject,
    onRotateObject: handleRotateObject,
    onSendToBack: handleSendToBack,
    undo,
    redo,
    canUndo,
    canRedo,
    catalogMode,
    setCatalogMode,
    filters,
    onBoardSelect: handleBoardSelect,
    onDeviceSelect: handleDeviceSelect,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
