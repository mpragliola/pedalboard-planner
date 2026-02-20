import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { initialObjects } from "../constants/defaults";
import { HISTORY_DEPTH } from "../constants/interaction";
import { DEFAULT_CANVAS_BACKGROUND } from "../constants/backgrounds";
import { createObjectIdGenerator } from "../lib/objectIdGenerator";
import { useBoardDeviceFilters } from "../hooks/useBoardDeviceFilters";
import { useHistory } from "../hooks/useHistory";
import { useBoardObjectActions } from "../hooks/useBoardObjectActions";
import { useCanvasCenterView } from "../hooks/useCanvasCenterView";
import { useCanvasInteractionOrchestrator } from "../hooks/useCanvasInteractionOrchestrator";
import { useCatalogPlacement } from "../hooks/useCatalogPlacement";
import type { CanvasObjectType, Cable } from "../types";
import type { SavedState } from "../lib/stateSerialization";
import { BoardIoProvider, type BoardIoContextValue } from "./BoardIoContext";
import { BoardProvider, type BoardContextValue } from "./BoardContext";
import { CableProvider, type CableContextValue } from "./CableContext";
import { CanvasProvider, type CanvasContextValue } from "./CanvasContext";
import { CatalogProvider, type CatalogContextValue, type CatalogMode } from "./CatalogContext";
import { HistoryProvider, type HistoryContextValue } from "./HistoryContext";
import { useStorage } from "./StorageContext";
import { UiProvider, type UiContextValue } from "./UiContext";
import { RenderingProvider, type RenderingContextValue, usePersistentMini3dLowResourceMode } from "./RenderingContext";
import { useBoardPersistence, type BoardState } from "./useBoardPersistence";
import { useSelection } from "./SelectionContext";

export function AppProvider({ children }: { children: ReactNode }) {
  const { savedState, loadStateFromFile, saveStateToFile, persistState } = useStorage();
  const objectIdGeneratorRef = useRef(createObjectIdGenerator());
  const seedObjectIdsFromObjects = useCallback((nextObjects: CanvasObjectType[]) => {
    objectIdGeneratorRef.current.seedFromObjects(nextObjects);
  }, []);
  useEffect(() => {
    if (savedState?.objects?.length) seedObjectIdsFromObjects(savedState.objects);
  }, [savedState, seedObjectIdsFromObjects]);

  const historyInitial = useMemo(() => {
    const objs = savedState?.objects ?? initialObjects;
    const cbl = savedState?.cables ?? [];
    return {
      state: { objects: objs, cables: cbl } as BoardState,
      past: (savedState?.past ?? []).map((o) => ({ objects: o, cables: cbl })),
      future: (savedState?.future ?? []).map((o) => ({ objects: o, cables: cbl })),
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- only on mount

  const {
    state: boardState,
    setState: setBoardState,
    replace: replaceHistoryRaw,
    undo,
    redo,
    canUndo,
    canRedo,
    past: historyPast,
    future: historyFuture,
  } = useHistory<BoardState>(historyInitial.state, HISTORY_DEPTH, {
    initialPast: historyInitial.past,
    initialFuture: historyInitial.future,
  });

  const objects = boardState.objects;
  const cables = boardState.cables;

  const setObjects = useCallback(
    (action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]), saveToHistory = true) => {
      setBoardState((prev) => {
        const newObjects = typeof action === "function" ? action(prev.objects) : action;
        return newObjects === prev.objects ? prev : { ...prev, objects: newObjects };
      }, saveToHistory);
    },
    [setBoardState]
  );

  const setCables = useCallback(
    (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory = true) => {
      setBoardState((prev) => {
        const newCables = typeof action === "function" ? action(prev.cables) : action;
        return newCables === prev.cables ? prev : { ...prev, cables: newCables };
      }, saveToHistory);
    },
    [setBoardState]
  );

  const [showGrid, setShowGrid] = useState(false);
  const [xray, setXray] = useState(false);
  const [showMini3d, setShowMini3d] = useState(false);
  const [showMini3dFloor, setShowMini3dFloor] = useState(true);
  const [showMini3dShadows, setShowMini3dShadows] = useState(true);
  const [showMini3dSurfaceDetail, setShowMini3dSurfaceDetail] = useState(true);
  const [showMini3dSpecular, setShowMini3dSpecular] = useState(true);
  const [mini3dLowResourceMode, setMini3dLowResourceMode] = usePersistentMini3dLowResourceMode();
  const [ruler, setRuler] = useState(false);
  const [lineRuler, setLineRuler] = useState(false);
  const [cableLayer, setCableLayer] = useState(false);
  const [cablesVisibility, setCablesVisibility] = useState<"shown" | "dim" | "hidden">("shown");
  const [unit, setUnit] = useState<"mm" | "in">(savedState?.unit ?? "mm");
  const [background, setBackground] = useState(savedState?.background ?? DEFAULT_CANVAS_BACKGROUND);
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("boards");
  const { setSelectedObjectIds, clearSelection } = useSelection();
  const [floatingUiVisible, setFloatingUiVisible] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  const {
    draggingObjectId,
    handleObjectPointerDown,
    handleCablePointerDown,
    handleCanvasPointerDown,
    clearObjectDragState,
    zoom,
    pan,
    zoomRef,
    panRef,
    setZoom,
    setPan,
    canvasAnimating,
    setCanvasAnimating,
    canvasRef,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    tileSize,
    pausePanZoom,
  } = useCanvasInteractionOrchestrator({
    objects,
    cables,
    setObjects,
    setCables,
    initialZoom: savedState?.zoom,
    initialPan: savedState?.pan,
  });

  const centerView = useCanvasCenterView({
    canvasRef,
    objects,
    zoom,
    setPan,
    setCanvasAnimating,
  });

  const {
    imageFailedIds,
    handleImageError,
    handleDeleteObject,
    handleRotateObject,
    handleSendToBack,
    handleBringToFront,
  } = useBoardObjectActions({
    setObjects,
    setSelectedObjectIds,
  });

  const filters = useBoardDeviceFilters({ boardTemplates: BOARD_TEMPLATES, deviceTemplates: DEVICE_TEMPLATES });
  const { setSelectedBoard, setSelectedDevice } = filters;

  const {
    handleBoardSelect,
    handleDeviceSelect,
    handleCustomCreate,
    placeFromCatalog,
    shouldIgnoreCatalogClick,
  } = useCatalogPlacement({
    canvasRef,
    zoom,
    pan,
    zoomRef,
    panRef,
    idGeneratorRef: objectIdGeneratorRef,
    setObjects,
    clearSelection,
    setSelectedBoard,
    setSelectedDevice,
  );

  const applyLoadedState = useCallback(
    (state: SavedState) => {
      if (state.objects?.length) seedObjectIdsFromObjects(state.objects);
      const loadedObjects = state.objects ?? initialObjects;
      const loadedCables = state.cables ?? [];
      replaceHistoryRaw(
        { objects: loadedObjects, cables: loadedCables },
        (state.past ?? []).map((snapshot) => ({ objects: snapshot, cables: loadedCables })),
        (state.future ?? []).map((snapshot) => ({ objects: snapshot, cables: loadedCables }))
      );
      clearSelection();
      setUnit(state.unit ?? "mm");
      setBackground(state.background ?? DEFAULT_CANVAS_BACKGROUND);
      setShowGrid(state.showGrid ?? false);
      if (typeof state.zoom === "number") setZoom(state.zoom);
      if (state.pan && typeof state.pan.x === "number" && typeof state.pan.y === "number") {
        setPan(state.pan);
      }
    },
    [
      seedObjectIdsFromObjects,
      replaceHistoryRaw,
      clearSelection,
      setUnit,
      setBackground,
      setShowGrid,
      setZoom,
      setPan,
    ]
  );

  const resetBoardState = useCallback(() => {
    replaceHistoryRaw({ objects: initialObjects, cables: [] }, [], []);
    clearSelection();
    setUnit("mm");
    setBackground(DEFAULT_CANVAS_BACKGROUND);
    setShowGrid(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [replaceHistoryRaw, clearSelection, setUnit, setBackground, setShowGrid, setZoom, setPan]);

  const { newBoard, loadBoardFromFile, saveBoardToFile } = useBoardPersistence({
    snapshot: {
      objects,
      cables,
      historyPast,
      historyFuture,
      zoom,
      pan,
      showGrid,
      unit,
      background,
    },
    storage: {
      loadStateFromFile,
      saveStateToFile,
      persistState,
    },
    actions: {
      applyLoadedState,
      resetBoardState,
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const addCable = useCallback(
    (cable: Cable) => {
      setCables((prev) => [...prev, cable]);
    },
    [setCables]
  );

  const uiValue = useMemo<UiContextValue>(
    () => ({
      showGrid,
      setShowGrid,
      xray,
      setXray,
      floatingUiVisible,
      setFloatingUiVisible,
      panelExpanded,
      setPanelExpanded,
      unit,
      setUnit,
      background,
      setBackground,
    }),
    [
      showGrid,
      setShowGrid,
      xray,
      setXray,
      floatingUiVisible,
      setFloatingUiVisible,
      panelExpanded,
      setPanelExpanded,
      unit,
      setUnit,
      background,
      setBackground,
    ]
  );

  const renderingValue = useMemo<RenderingContextValue>(
    () => ({
      showMini3d,
      setShowMini3d,
      showMini3dFloor,
      setShowMini3dFloor,
      showMini3dShadows,
      setShowMini3dShadows,
      showMini3dSurfaceDetail,
      setShowMini3dSurfaceDetail,
      showMini3dSpecular,
      setShowMini3dSpecular,
      mini3dLowResourceMode,
      setMini3dLowResourceMode,
      ruler,
      setRuler,
      lineRuler,
      setLineRuler,
      cableLayer,
      setCableLayer,
      cablesVisibility,
      setCablesVisibility,
    }),
    [
      showMini3d,
      setShowMini3d,
      showMini3dFloor,
      setShowMini3dFloor,
      showMini3dShadows,
      setShowMini3dShadows,
      showMini3dSurfaceDetail,
      setShowMini3dSurfaceDetail,
      showMini3dSpecular,
      setShowMini3dSpecular,
      mini3dLowResourceMode,
      setMini3dLowResourceMode,
      ruler,
      setRuler,
      lineRuler,
      setLineRuler,
      cableLayer,
      setCableLayer,
      cablesVisibility,
      setCablesVisibility,
    ]
  );

  const canvasValue = useMemo<CanvasContextValue>(
    () => ({
      canvasRef,
      zoom,
      pan,
      tileSize,
      isPanning,
      spaceDown,
      zoomIn,
      zoomOut,
      centerView,
      canvasAnimating,
      setCanvasAnimating,
      handleCanvasPointerDown,
      pausePanZoom,
    }),
    [
      canvasRef,
      zoom,
      pan,
      tileSize,
      isPanning,
      spaceDown,
      zoomIn,
      zoomOut,
      centerView,
      canvasAnimating,
      setCanvasAnimating,
      handleCanvasPointerDown,
      pausePanZoom,
    ]
  );

  const boardValue = useMemo<BoardContextValue>(
    () => ({
      objects,
      setObjects,
      imageFailedIds,
      draggingObjectId,
      onImageError: handleImageError,
      onObjectPointerDown: handleObjectPointerDown,
      onDragEnd: clearObjectDragState,
      onDeleteObject: handleDeleteObject,
      onRotateObject: handleRotateObject,
      onSendToBack: handleSendToBack,
      onBringToFront: handleBringToFront,
    }),
    [
      objects,
      setObjects,
      imageFailedIds,
      draggingObjectId,
      handleImageError,
      handleObjectPointerDown,
      clearObjectDragState,
      handleDeleteObject,
      handleRotateObject,
      handleSendToBack,
      handleBringToFront,
    ]
  );

  const cableValue = useMemo<CableContextValue>(
    () => ({
      cables,
      setCables,
      addCable,
      onCablePointerDown: handleCablePointerDown,
    }),
    [cables, setCables, addCable, handleCablePointerDown]
  );

  const catalogValue = useMemo<CatalogContextValue>(
    () => ({
      dropdownPanelRef,
      catalogMode,
      setCatalogMode,
      filters,
      onBoardSelect: handleBoardSelect,
      onDeviceSelect: handleDeviceSelect,
      placeFromCatalog,
      shouldIgnoreCatalogClick,
      onCustomBoardCreate: (params) => handleCustomCreate("boards", params),
      onCustomDeviceCreate: (params) => handleCustomCreate("devices", params),
      onCustomCreate: handleCustomCreate,
    }),
    [
      dropdownPanelRef,
      catalogMode,
      setCatalogMode,
      filters,
      handleBoardSelect,
      handleDeviceSelect,
      placeFromCatalog,
      shouldIgnoreCatalogClick,
      handleCustomCreate,
    ]
  );

  const historyValue = useMemo<HistoryContextValue>(
    () => ({
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [undo, redo, canUndo, canRedo]
  );

  const boardIoValue = useMemo<BoardIoContextValue>(
    () => ({
      newBoard,
      loadBoardFromFile,
      saveBoardToFile,
    }),
    [newBoard, loadBoardFromFile, saveBoardToFile]
  );

  return (
    <UiProvider value={uiValue}>
      <RenderingProvider value={renderingValue}>
        <CanvasProvider value={canvasValue}>
          <BoardProvider value={boardValue}>
            <CableProvider value={cableValue}>
              <CatalogProvider value={catalogValue}>
                <HistoryProvider value={historyValue}>
                  <BoardIoProvider value={boardIoValue}>{children}</BoardIoProvider>
                </HistoryProvider>
              </CatalogProvider>
            </CableProvider>
          </BoardProvider>
        </CanvasProvider>
      </RenderingProvider>
    </UiProvider>
  );
}
