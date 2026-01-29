import { useState, useCallback, useRef } from 'react'
import { Canvas } from './components/Canvas'
import { DropdownsPanel } from './components/DropdownsPanel'
import { ZoomControls } from './components/ZoomControls'
import { BOARD_TEMPLATES } from './data/boards'
import { DEVICE_TEMPLATES } from './data/devices'
import { initialObjects } from './constants'
import { createObjectFromBoardTemplate, createObjectFromDeviceTemplate } from './lib/templateHelpers'
import { useCanvasZoomPan } from './hooks/useCanvasZoomPan'
import { useObjectDrag } from './hooks/useObjectDrag'
import { useBoardDeviceFilters } from './hooks/useBoardDeviceFilters'
import type { CanvasObjectType } from './types'
import './App.css'

export type { BoardType } from './data/boards'
export type { DeviceType } from './data/devices'
export type { CanvasObjectType, ObjectSubtype } from './types'

function App() {
  const [objects, setObjects] = useState<CanvasObjectType[]>(initialObjects)
  const setObjectsRef = useRef(setObjects)
  setObjectsRef.current = setObjects
  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set())
  const [showGrid, setShowGrid] = useState(false)
  /** Grid/display units: mm (metric) or in (imperial). */
  const [unit, setUnit] = useState<'mm' | 'in'>('mm')
  /** Catalog panel mode: boards or devices (only one section visible). */
  const [catalogMode, setCatalogMode] = useState<'boards' | 'devices'>('boards')
  /** Selected object ids. Single id for now; ready for multi-selection (shift/ctrl+click later). */
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

  const filters = useBoardDeviceFilters()
  const {
    selectedBoard,
    setSelectedBoard,
    selectedDevice,
    setSelectedDevice,
    boardBrandFilter,
    setBoardBrandFilter,
    boardTextFilter,
    setBoardTextFilter,
    boardWidthMin,
    setBoardWidthMin,
    boardWidthMax,
    setBoardWidthMax,
    boardDepthMin,
    setBoardDepthMin,
    boardDepthMax,
    setBoardDepthMax,
    deviceBrandFilter,
    setDeviceBrandFilter,
    deviceTypeFilter,
    setDeviceTypeFilter,
    deviceTextFilter,
    setDeviceTextFilter,
    deviceWidthMin,
    setDeviceWidthMin,
    deviceWidthMax,
    setDeviceWidthMax,
    deviceDepthMin,
    setDeviceDepthMin,
    deviceDepthMax,
    setDeviceDepthMax,
    boardWidthRange,
    boardDepthRange,
    deviceWidthRange,
    deviceDepthRange,
    boardBrands,
    deviceBrands,
    filteredBoards,
    filteredDevices,
    resetBoardFilters,
    resetDeviceFilters,
  } = filters

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
      setObjectsRef.current((prev) => [...prev, newObj])
    },
    [getPlacementBesideDropdown]
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
      setObjectsRef.current((prev) => [...prev, newObj])
    },
    [getPlacementBesideDropdown]
  )

  const handleDeleteObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id))
    setSelectedObjectIds((prev) => prev.filter((sid) => sid !== id))
  }, [])

  const handleRotateObject = useCallback((id: string) => {
    setObjects((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, rotation: ((o.rotation ?? 0) + 90) % 360 } : o
      )
    )
  }, [])

  const handleReorder = useCallback((id: string, direction: 'forward' | 'backward') => {
    setObjectsRef.current((prev) => {
      const i = prev.findIndex((o) => o.id === id)
      const j = direction === 'forward' ? i + 1 : i - 1
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = prev.slice()
      next[i] = prev[j]
      next[j] = prev[i]
      return next
    })
  }, [])

  return (
    <>
      <Canvas
        zoom={zoom}
        pan={pan}
        tileSize={tileSize}
        showGrid={showGrid}
        unit={unit}
        isPanning={isPanning}
        spaceDown={spaceDown}
        canvasRef={canvasRef}
        onCanvasMouseDown={handleCanvasMouseDown}
        objects={objects}
        selectedObjectIds={selectedObjectIds}
        imageFailedIds={imageFailedIds}
        draggingObjectId={draggingObjectId}
        onImageError={handleImageError}
        onObjectPointerDown={handleObjectPointerDown}
        onDragEnd={clearDragState}
        onDeleteObject={handleDeleteObject}
        onRotateObject={handleRotateObject}
        onReorder={handleReorder}
      />
      <DropdownsPanel
        ref={dropdownPanelRef}
        catalogMode={catalogMode}
        onCatalogModeChange={setCatalogMode}
        unit={unit}
        onUnitChange={setUnit}
        boardBrandFilter={boardBrandFilter}
        setBoardBrandFilter={setBoardBrandFilter}
        boardTextFilter={boardTextFilter}
        setBoardTextFilter={setBoardTextFilter}
        boardWidthMin={boardWidthMin}
        setBoardWidthMin={setBoardWidthMin}
        boardWidthMax={boardWidthMax}
        setBoardWidthMax={setBoardWidthMax}
        boardDepthMin={boardDepthMin}
        setBoardDepthMin={setBoardDepthMin}
        boardDepthMax={boardDepthMax}
        setBoardDepthMax={setBoardDepthMax}
        boardBrands={boardBrands}
        boardWidthRange={boardWidthRange}
        boardDepthRange={boardDepthRange}
        filteredBoards={filteredBoards}
        selectedBoard={selectedBoard}
        onBoardSelect={handleBoardSelect}
        onResetBoardFilters={resetBoardFilters}
        hasBoardFilters={!!(boardBrandFilter || boardTextFilter || boardWidthMin || boardWidthMax || boardDepthMin || boardDepthMax)}
        deviceTypeFilter={deviceTypeFilter}
        setDeviceTypeFilter={setDeviceTypeFilter}
        deviceBrandFilter={deviceBrandFilter}
        setDeviceBrandFilter={setDeviceBrandFilter}
        deviceTextFilter={deviceTextFilter}
        setDeviceTextFilter={setDeviceTextFilter}
        deviceWidthMin={deviceWidthMin}
        setDeviceWidthMin={setDeviceWidthMin}
        deviceWidthMax={deviceWidthMax}
        setDeviceWidthMax={setDeviceWidthMax}
        deviceDepthMin={deviceDepthMin}
        setDeviceDepthMin={setDeviceDepthMin}
        deviceDepthMax={deviceDepthMax}
        setDeviceDepthMax={setDeviceDepthMax}
        deviceBrands={deviceBrands}
        deviceWidthRange={deviceWidthRange}
        deviceDepthRange={deviceDepthRange}
        filteredDevices={filteredDevices}
        selectedDevice={selectedDevice}
        onDeviceSelect={handleDeviceSelect}
        onResetDeviceFilters={resetDeviceFilters}
        hasDeviceFilters={!!(deviceBrandFilter || deviceTypeFilter || deviceTextFilter || deviceWidthMin || deviceWidthMax || deviceDepthMin || deviceDepthMax)}
      />
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
      />
    </>
  )
}

export default App
