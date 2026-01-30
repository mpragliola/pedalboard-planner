import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { BOARD_TEMPLATES } from '../data/boards'
import { DEVICE_TEMPLATES } from '../data/devices'
import { initialObjects } from '../constants'
import {
  createObjectFromBoardTemplate,
  createObjectFromDeviceTemplate,
  initNextObjectIdFromObjects,
} from '../lib/templateHelpers'
import { useCanvasZoomPan } from '../hooks/useCanvasZoomPan'
import { useObjectDrag } from '../hooks/useObjectDrag'
import { useBoardDeviceFilters } from '../hooks/useBoardDeviceFilters'
import { useHistory } from '../hooks/useHistory'
import type { CanvasObjectType } from '../types'

const STORAGE_KEY = 'pedal/state'

interface SavedState {
  objects: CanvasObjectType[]
  past?: CanvasObjectType[][]
  future?: CanvasObjectType[][]
  zoom?: number
  pan?: { x: number; y: number }
  showGrid?: boolean
  unit?: 'mm' | 'in'
}

function isValidObject(o: unknown): o is CanvasObjectType {
  if (typeof o !== 'object' || o === null) return false
  const t = o as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.subtype === 'string' &&
    typeof t.x === 'number' &&
    typeof t.y === 'number' &&
    typeof t.width === 'number' &&
    typeof t.depth === 'number' &&
    typeof t.height === 'number' &&
    typeof t.name === 'string'
  )
}

function isValidObjectArray(arr: unknown): arr is CanvasObjectType[] {
  return Array.isArray(arr) && arr.every(isValidObject)
}

function loadFromStorage(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as unknown
    if (typeof data !== 'object' || data === null || !('objects' in data)) return null
    const objects = (data as SavedState).objects
    if (!isValidObjectArray(objects)) return null
    const past = (data as SavedState).past
    const future = (data as SavedState).future
    return {
      objects,
      past: Array.isArray(past) && past.every(isValidObjectArray) ? past : undefined,
      future: Array.isArray(future) && future.every(isValidObjectArray) ? future : undefined,
      zoom: typeof (data as SavedState).zoom === 'number' ? (data as SavedState).zoom : undefined,
      pan:
        typeof (data as SavedState).pan === 'object' &&
          (data as SavedState).pan !== null &&
          'x' in (data as SavedState).pan! &&
          'y' in (data as SavedState).pan!
          ? (data as SavedState).pan
          : undefined,
      showGrid: typeof (data as SavedState).showGrid === 'boolean' ? (data as SavedState).showGrid : undefined,
      unit: (data as SavedState).unit === 'mm' || (data as SavedState).unit === 'in' ? (data as SavedState).unit : undefined,
    }
  } catch {
    return null
  }
}

function saveToStorage(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota or disabled
  }
}

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
  handleCanvasPointerDown: (e: React.PointerEvent) => void
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
  // Floating UI visibility
  floatingUiVisible: boolean
  setFloatingUiVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedState] = useState<SavedState | null>(() => {
    const state = loadFromStorage()
    if (state?.objects?.length) initNextObjectIdFromObjects(state.objects)
    return state
  })

  const historyInitial = useMemo(
    () => ({
      objects: savedState?.objects ?? initialObjects,
      past: savedState?.past ?? [],
      future: savedState?.future ?? [],
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps -- only on mount
  )

  const {
    state: objects,
    setState: setObjects,
    undo,
    redo,
    canUndo,
    canRedo,
    past,
    future,
  } = useHistory<CanvasObjectType[]>(historyInitial.objects, 200, {
    initialPast: historyInitial.past,
    initialFuture: historyInitial.future,
  })

  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set())
  const [showGrid, setShowGrid] = useState(false)
  const [unit, setUnit] = useState<'mm' | 'in'>(savedState?.unit ?? 'mm')
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('boards')
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([])
  const [floatingUiVisible, setFloatingUiVisible] = useState(true)
  const dropdownPanelRef = useRef<HTMLDivElement>(null)

  const {
    zoom,
    pan,
    canvasRef,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    handleCanvasPointerDown: canvasPanPointerDown,
    tileSize,
  } = useCanvasZoomPan({
    initialZoom: savedState?.zoom,
    initialPan: savedState?.pan,
  })

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

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 0 && !spaceDown && !(e.target as Element).closest('.canvas-object-wrapper')) {
        setSelectedObjectIds([])
      }
      canvasPanPointerDown(e)
    },
    [spaceDown, canvasPanPointerDown]
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
      const { x, y } = getPlacementBesideDropdown()
      const newObj = createObjectFromBoardTemplate(template, x, y)
      setObjects((prev) => [...prev, newObj])
      setSelectedBoard('')
      setSelectedObjectIds([])
    },
    [setSelectedBoard, setSelectedObjectIds, getPlacementBesideDropdown, setObjects]
  )

  const handleDeviceSelect = useCallback(
    (templateId: string) => {
      const id = templateId?.trim()
      if (!id) return
      const template = DEVICE_TEMPLATES.find((t) => t.id === id)
      if (!template) return
      const { x, y } = getPlacementBesideDropdown()
      const newObj = createObjectFromDeviceTemplate(template, x, y)
      setObjects((prev) => [...prev, newObj])
      setSelectedDevice('')
      setSelectedObjectIds([])
    },
    [setSelectedDevice, setSelectedObjectIds, getPlacementBesideDropdown, setObjects]
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

  // Persist state (and undo history) to localStorage, debounced
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null
      saveToStorage({
        objects,
        past,
        future,
        zoom,
        pan,
        showGrid,
        unit,
      })
    }, 400)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [objects, past, future, zoom, pan, showGrid, unit])

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
    handleCanvasPointerDown,
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
    floatingUiVisible,
    setFloatingUiVisible,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
