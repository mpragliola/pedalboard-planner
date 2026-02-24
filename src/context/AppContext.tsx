import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { initialObjects } from "../constants/defaults";
import { HISTORY_DEPTH } from "../constants/interaction";
import { DEFAULT_CANVAS_BACKGROUND } from "../constants/backgrounds";
import { createObjectIdGenerator } from "../lib/object/objectIdGenerator";
import { useBoardDeviceFilters } from "../hooks/useBoardDeviceFilters";
import { useHistory, type HistoryCommand } from "../hooks/useHistory";
import { useBoardObjectActions } from "../hooks/useBoardObjectActions";
import { useCanvasCenterView } from "../hooks/useCanvasCenterView";
import { useCanvasInteractionOrchestrator } from "../hooks/useCanvasInteractionOrchestrator";
import { useCatalogPlacement } from "../hooks/useCatalogPlacement";
import type { CanvasObjectType, Cable } from "../types";
import type { SavedState } from "../lib/state/stateSerialization";
import { BoardIoProvider, type BoardIoContextValue } from "./BoardIoContext";
import { BoardProvider, type BoardContextValue } from "./BoardContext";
import { CableProvider, type CableContextValue } from "./CableContext";
import { CanvasProvider, type CanvasContextValue } from "./CanvasContext";
import { CatalogProvider, type CatalogContextValue, type CatalogMode } from "./CatalogContext";
import { HistoryProvider, type HistoryContextValue } from "./HistoryContext";
import { TemplateServiceProvider } from "./TemplateServiceContext";
import { useStorage } from "./StorageContext";
import { UiProvider, type UiContextValue } from "./UiContext";
import { RenderingProvider, type RenderingContextValue } from "./RenderingContext";
import { Mini3dProvider, type Mini3dContextValue, usePersistentMini3dLowResourceMode } from "./Mini3dContext";
import { useBoardPersistence, type BoardState } from "./useBoardPersistence";
import { useSelection } from "./SelectionContext";
import {
  createAddCableCommand,
  createBringCableToFrontCommand,
  createDeleteCableCommand,
  createSendCableToBackCommand,
  createUpsertCableCommand,
} from "./boardStateCommands";

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
    executeCommand,
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

  const executeBoardCommand = useCallback(
    (command: HistoryCommand<BoardState>) => {
      // Commands are reversible operations that avoid full-state snapshots in history.
      executeCommand(command);
    },
    [executeCommand]
  );

  const applyObjects = useCallback(
    (
      action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]),
      saveToHistory: boolean
    ) => {
      setBoardState((prev) => {
        const newObjects = typeof action === "function" ? action(prev.objects) : action;
        return newObjects === prev.objects ? prev : { ...prev, objects: newObjects };
      }, saveToHistory);
    },
    [setBoardState]
  );

  const setObjectsWithHistory = useCallback(
    (action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[])) => {
      applyObjects(action, true);
    },
    [applyObjects]
  );

  const setObjectsSilent = useCallback(
    (action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[])) => {
      applyObjects(action, false);
    },
    [applyObjects]
  );

  // Backward-compatible shim while call sites migrate to explicit methods.
  const setObjects = useCallback(
    (action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]), saveToHistory = true) => {
      applyObjects(action, saveToHistory);
    },
    [applyObjects]
  );

  const applyCables = useCallback(
    (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory: boolean) => {
      setBoardState((prev) => {
        const newCables = typeof action === "function" ? action(prev.cables) : action;
        return newCables === prev.cables ? prev : { ...prev, cables: newCables };
      }, saveToHistory);
    },
    [setBoardState]
  );

  const setCablesWithHistory = useCallback(
    (action: Cable[] | ((prev: Cable[]) => Cable[])) => {
      applyCables(action, true);
    },
    [applyCables]
  );

  const setCablesSilent = useCallback(
    (action: Cable[] | ((prev: Cable[]) => Cable[])) => {
      applyCables(action, false);
    },
    [applyCables]
  );

  // Backward-compatible shim while call sites migrate to explicit methods.
  const setCables = useCallback(
    (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory = true) => {
      applyCables(action, saveToHistory);
    },
    [applyCables]
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
    gesture,
  } = useCanvasInteractionOrchestrator({
    objects,
    cables,
    setObjectsWithHistory,
    setObjectsSilent,
    setCablesWithHistory,
    setCablesSilent,
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
    executeBoardCommand,
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
    setObjectsWithHistory,
    clearSelection,
    setSelectedBoard,
    setSelectedDevice,
  });

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
      executeBoardCommand(createAddCableCommand(cable));
    },
    [executeBoardCommand]
  );

  const upsertCable = useCallback(
    (cable: Cable) => {
      executeBoardCommand(createUpsertCableCommand(cable));
    },
    [executeBoardCommand]
  );

  const deleteCable = useCallback(
    (id: string) => {
      executeBoardCommand(createDeleteCableCommand(id));
    },
    [executeBoardCommand]
  );

  const sendCableToBack = useCallback(
    (id: string) => {
      executeBoardCommand(createSendCableToBackCommand(id));
    },
    [executeBoardCommand]
  );

  const bringCableToFront = useCallback(
    (id: string) => {
      executeBoardCommand(createBringCableToFrontCommand(id));
    },
    [executeBoardCommand]
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

  const mini3dValue = useMemo<Mini3dContextValue>(
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
    ]
  );

  const renderingValue = useMemo<RenderingContextValue>(
    () => ({ ruler, setRuler, lineRuler, setLineRuler, cableLayer, setCableLayer, cablesVisibility, setCablesVisibility }),
    [ruler, setRuler, lineRuler, setLineRuler, cableLayer, setCableLayer, cablesVisibility, setCablesVisibility]
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
      gesture,
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
      gesture,
    ]
  );

  const boardValue = useMemo<BoardContextValue>(
    () => ({
      objects,
      setObjects,
      setObjectsWithHistory,
      setObjectsSilent,
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
      setObjectsWithHistory,
      setObjectsSilent,
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
      setCablesWithHistory,
      setCablesSilent,
      addCable,
      upsertCable,
      deleteCable,
      sendCableToBack,
      bringCableToFront,
      onCablePointerDown: handleCablePointerDown,
    }),
    [
      cables,
      setCables,
      setCablesWithHistory,
      setCablesSilent,
      addCable,
      upsertCable,
      deleteCable,
      sendCableToBack,
      bringCableToFront,
      handleCablePointerDown,
    ]
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

  // Provide TemplateService once at the app boundary so React consumers use DI
  // instead of importing module-level singletons.
  return (
    <TemplateServiceProvider>
      <UiProvider value={uiValue}>
        <Mini3dProvider value={mini3dValue}>
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
        </Mini3dProvider>
      </UiProvider>
    </TemplateServiceProvider>
  );
}
