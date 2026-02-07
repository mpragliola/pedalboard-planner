import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { initialObjects, MM_TO_PX, HISTORY_DEPTH, DEBOUNCE_SAVE_MS, DEFAULT_PLACEMENT_FALLBACK } from "../constants";
import {
  createObjectFromTemplate,
  createObjectFromCustomBoard,
  createObjectFromCustomDevice,
  initNextObjectIdFromObjects,
} from "../lib/templateHelpers";
import { StateManager, getObjectDimensions, type SavedState } from "../lib/stateManager";
import { visibleViewportPlacement } from "../lib/placementStrategy";
import { useCanvasZoomPan } from "../hooks/useCanvasZoomPan";
import { useCableDrag } from "../hooks/useCableDrag";
import { useObjectDrag } from "../hooks/useObjectDrag";
import { useBoardDeviceFilters } from "../hooks/useBoardDeviceFilters";
import { useHistory } from "../hooks/useHistory";
import { useCatalogDrag } from "../hooks/useCatalogDrag";
import { getObjectAabb } from "../lib/snapToBoundingBox";
import type { CanvasObjectType, Cable } from "../types";
import { BoardIoProvider, type BoardIoContextValue } from "./BoardIoContext";
import { BoardProvider, type BoardContextValue } from "./BoardContext";
import { CableProvider, type CableContextValue } from "./CableContext";
import { CanvasProvider, type CanvasContextValue } from "./CanvasContext";
import { CatalogProvider, type CatalogContextValue, type CatalogMode } from "./CatalogContext";
import { HistoryProvider, type HistoryContextValue } from "./HistoryContext";
import { UiProvider, type UiContextValue } from "./UiContext";

const stateManager = new StateManager("pedal/state");

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedState] = useState<SavedState | null>(() => {
    const state = stateManager.load();
    if (state?.objects?.length) initNextObjectIdFromObjects(state.objects);
    return state;
  });

  /** Compound state so undo/redo covers both objects and cables in a single timeline. */
  interface BoardState {
    objects: CanvasObjectType[];
    cables: Cable[];
  }

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

  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set());
  const [showGrid, setShowGrid] = useState(false);
  const [xray, setXray] = useState(false);
  const [showMini3d, setShowMini3d] = useState(false);
  const [ruler, setRuler] = useState(false);
  const [lineRuler, setLineRuler] = useState(false);
  const [cableLayer, setCableLayer] = useState(false);
  const [cablesVisible, setCablesVisible] = useState(true);
  const [unit, setUnit] = useState<"mm" | "in">(savedState?.unit ?? "mm");
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("boards");
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [floatingUiVisible, setFloatingUiVisible] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  const clearDragStateRef = useRef<() => void>(() => {});

  /** Ref updated each render so addCableAndPersist can save synchronously with latest state. */
  const stateForSaveRef = useRef<SavedState>({
    objects: initialObjects,
    past: [],
    future: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: false,
    unit: "mm",
    cables: [],
  });

  const {
    zoom,
    pan,
    zoomRef,
    panRef,
    setZoom,
    setPan,
    animating: canvasAnimating,
    setAnimating: setCanvasAnimating,
    canvasRef,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    handleCanvasPointerDown: canvasPanPointerDown,
    tileSize,
    pausePanZoom,
  } = useCanvasZoomPan({
    initialZoom: savedState?.zoom,
    initialPan: savedState?.pan,
    onPinchStart: () => clearDragStateRef.current(),
  });

  const { draggingObjectId, handleObjectDragStart, clearDragState: clearObjectDragState } = useObjectDrag(
    objects,
    setObjects,
    zoom,
    spaceDown
  );
  const { handleCableDragStart, clearDragState: clearCableDragState } = useCableDrag(
    cables,
    setCables,
    zoom,
    spaceDown
  );

  useEffect(() => {
    clearDragStateRef.current = () => {
      clearObjectDragState();
      clearCableDragState();
    };
    return () => {
      clearDragStateRef.current = () => {};
    };
  }, [clearObjectDragState, clearCableDragState]);

  const filters = useBoardDeviceFilters();
  const { setSelectedBoard, setSelectedDevice } = filters;

  const handleObjectPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      setSelectedObjectIds([id]);
      handleObjectDragStart(id, e);
    },
    [handleObjectDragStart]
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 0 && !spaceDown) {
        const target = e.target as Element | null;
        const hitSelectable =
          target?.closest(
            ".canvas-object-wrapper, .cable-hit-area, .cable-endpoint-dot, .cable-connector-label"
          ) ?? false;
        if (!hitSelectable) {
          setSelectedObjectIds([]);
          setSelectedCableId(null);
        }
      }
      canvasPanPointerDown(e);
    },
    [spaceDown, canvasPanPointerDown]
  );

  const handleCablePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      setSelectedCableId(id);
      handleCableDragStart(id, e);
    },
    [handleCableDragStart]
  );

  const handleImageError = useCallback((id: string) => {
    setImageFailedIds((prev) => new Set(prev).add(id));
  }, []);

  /** Uses placement strategy so new device/board appears at center of browser viewport. */
  const getPlacementInVisibleViewport = useCallback((): { x: number; y: number } => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return DEFAULT_PLACEMENT_FALLBACK;
    return visibleViewportPlacement({
      canvasRect: canvasEl.getBoundingClientRect(),
      pan,
      zoom,
      viewportCenter: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }, [pan, zoom, canvasRef]);

  /** Axis-aligned bbox center of all objects. One setPan + CSS transition. */
  const centerView = useCallback(() => {
    const el = canvasRef.current;
    if (!el || objects.length === 0) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const obj of objects) {
      const aabb = getObjectAabb(obj, getObjectDimensions);
      minX = Math.min(minX, aabb.left);
      minY = Math.min(minY, aabb.top);
      maxX = Math.max(maxX, aabb.left + aabb.width);
      maxY = Math.max(maxY, aabb.top + aabb.height);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rect = el.getBoundingClientRect();
    const targetPan = {
      x: rect.width / 2 - cx * zoom,
      y: rect.height / 2 - cy * zoom,
    };
    setCanvasAnimating(true);
    /* Defer so CSS sees old pan first, then new → transition runs */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPan(targetPan));
    });
  }, [objects, zoom, setPan, setCanvasAnimating, canvasRef]);

  /** Core function to add an object from a template at a specific position */
  const addObjectFromTemplate = useCallback(
    (mode: "boards" | "devices", templateId: string, canvasX: number, canvasY: number) => {
      const id = templateId?.trim();
      if (!id) return;

      const templates = mode === "boards" ? BOARD_TEMPLATES : DEVICE_TEMPLATES;
      const template = templates.find((t) => t.id === id);
      if (!template) return;

      const subtype = mode === "boards" ? "board" : ("device" as const);
      const w = template.wdh[0] * MM_TO_PX;
      const d = template.wdh[1] * MM_TO_PX;
      const newObj = createObjectFromTemplate(subtype, template, { x: canvasX - w / 2, y: canvasY - d / 2 });

      setObjects((prev) => [...prev, newObj]);
      (mode === "boards" ? setSelectedBoard : setSelectedDevice)("");
      setSelectedObjectIds([]);
      setSelectedCableId(null);
    },
    [setSelectedBoard, setSelectedDevice, setSelectedObjectIds, setSelectedCableId, setObjects]
  );

  const handleBoardSelect = useCallback(
    (templateId: string) => {
      const { x, y } = getPlacementInVisibleViewport();
      addObjectFromTemplate("boards", templateId, x, y);
    },
    [getPlacementInVisibleViewport, addObjectFromTemplate]
  );

  const handleDeviceSelect = useCallback(
    (templateId: string) => {
      const { x, y } = getPlacementInVisibleViewport();
      addObjectFromTemplate("devices", templateId, x, y);
    },
    [getPlacementInVisibleViewport, addObjectFromTemplate]
  );

  const { placeFromCatalog, shouldIgnoreCatalogClick } = useCatalogDrag({
    canvasRef,
    zoomRef,
    panRef,
    onDropOnCanvas: addObjectFromTemplate,
  });

  const handleCustomCreate = useCallback(
    (mode: "boards" | "devices", params: { widthMm: number; depthMm: number; color: string; name: string }) => {
      const { x: cx, y: cy } = getPlacementInVisibleViewport();
      const w = params.widthMm * MM_TO_PX;
      const d = params.depthMm * MM_TO_PX;
      const createFn = mode === "boards" ? createObjectFromCustomBoard : createObjectFromCustomDevice;
      const newObj = createFn(params, { x: cx - w / 2, y: cy - d / 2 });
      setObjects((prev) => [...prev, newObj]);
      (mode === "boards" ? setSelectedBoard : setSelectedDevice)("");
      setSelectedObjectIds([]);
      setSelectedCableId(null);
    },
    [setSelectedBoard, setSelectedDevice, setSelectedObjectIds, setSelectedCableId, getPlacementInVisibleViewport, setObjects]
  );

  const handleDeleteObject = useCallback(
    (id: string) => {
      setObjects((prev) => prev.filter((o) => o.id !== id));
      setSelectedObjectIds((prev) => prev.filter((sid) => sid !== id));
      setSelectedCableId(null);
    },
    [setObjects]
  );

  const handleRotateObject = useCallback(
    (id: string) => {
      setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, rotation: ((o.rotation ?? 0) + 90) % 360 } : o)));
    },
    [setObjects]
  );

  const handleSendToBack = useCallback(
    (id: string) => {
      setObjects((prev) => {
        const i = prev.findIndex((o) => o.id === id);
        if (i <= 0) return prev;
        const obj = prev[i];
        const next = prev.slice(0, i).concat(prev.slice(i + 1));
        return [obj, ...next];
      });
    },
    [setObjects]
  );

  const handleBringToFront = useCallback(
    (id: string) => {
      setObjects((prev) => {
        const i = prev.findIndex((o) => o.id === id);
        if (i < 0 || i === prev.length - 1) return prev;
        const obj = prev[i];
        const next = prev.slice(0, i).concat(prev.slice(i + 1));
        return [...next, obj];
      });
    },
    [setObjects]
  );

  const loadBoardState = useCallback(
    (state: SavedState) => {
      if (state.objects?.length) initNextObjectIdFromObjects(state.objects);
      const cbl = state.cables ?? [];
      replaceHistoryRaw(
        { objects: state.objects ?? initialObjects, cables: cbl },
        (state.past ?? []).map((o) => ({ objects: o, cables: cbl })),
        (state.future ?? []).map((o) => ({ objects: o, cables: cbl }))
      );
      setSelectedObjectIds([]);
      setSelectedCableId(null);
      setUnit(state.unit ?? "mm");
      setShowGrid(state.showGrid ?? false);
      if (typeof state.zoom === "number") setZoom(state.zoom);
      if (state.pan && typeof state.pan.x === "number" && typeof state.pan.y === "number") {
        setPan(state.pan);
      }
    },
    [replaceHistoryRaw, setZoom, setPan]
  );

  const newBoard = useCallback(() => {
    replaceHistoryRaw({ objects: initialObjects, cables: [] }, [], []);
    setSelectedObjectIds([]);
    setSelectedCableId(null);
    setUnit("mm");
    setShowGrid(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [replaceHistoryRaw, setZoom, setPan]);

  const loadBoardFromFile = useCallback(
    async (file: File): Promise<void> => {
      let text = "";
      try {
        text = await file.text();
      } catch {
        throw new Error("Could not read the selected file.");
      }
      const state = StateManager.parseState(text);
      if (!state) {
        throw new Error("The selected file is not a valid pedalboard JSON file.");
      }
      loadBoardState(state);
    },
    [loadBoardState]
  );

  const saveBoardToFile = useCallback(() => {
    const state: SavedState = {
      objects,
      zoom,
      pan,
      showGrid,
      unit,
      cables,
    };
    const payload = StateManager.serializeState(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedalboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [objects, zoom, pan, showGrid, unit, cables]);

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

  // Extract objects-only past/future for persistence (cable undo is in-session only)
  const pastForSave = useMemo(() => historyPast.map((e) => e.objects), [historyPast]);
  const futureForSave = useMemo(() => historyFuture.map((e) => e.objects), [historyFuture]);

  // Persist state (and undo history) to localStorage, debounced
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      stateManager.save({
        objects,
        past: pastForSave,
        future: futureForSave,
        zoom,
        pan,
        showGrid,
        unit,
        cables,
      });
    }, DEBOUNCE_SAVE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [objects, pastForSave, futureForSave, zoom, pan, showGrid, unit, cables]);

  // Persist immediately when cables change (cables are user data; don't rely only on debounce)
  useEffect(() => {
    stateManager.save({
      objects,
      past: pastForSave,
      future: futureForSave,
      zoom,
      pan,
      showGrid,
      unit,
      cables,
    });
  }, [cables]); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally only on cables

  stateForSaveRef.current = {
    objects,
    past: pastForSave,
    future: futureForSave,
    zoom,
    pan,
    showGrid,
    unit,
    cables,
  };

  const addCableAndPersist = useCallback(
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
      showMini3d,
      setShowMini3d,
      ruler,
      setRuler,
      lineRuler,
      setLineRuler,
      cableLayer,
      setCableLayer,
      cablesVisible,
      setCablesVisible,
      floatingUiVisible,
      setFloatingUiVisible,
      panelExpanded,
      setPanelExpanded,
      unit,
      setUnit,
    }),
    [
      showGrid,
      setShowGrid,
      xray,
      setXray,
      showMini3d,
      setShowMini3d,
      ruler,
      setRuler,
      lineRuler,
      setLineRuler,
      cableLayer,
      setCableLayer,
      cablesVisible,
      setCablesVisible,
      floatingUiVisible,
      setFloatingUiVisible,
      panelExpanded,
      setPanelExpanded,
      unit,
      setUnit,
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
      selectedObjectIds,
      setSelectedObjectIds,
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
      selectedObjectIds,
      setSelectedObjectIds,
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
      addCableAndPersist,
      selectedCableId,
      setSelectedCableId,
      onCablePointerDown: handleCablePointerDown,
    }),
    [cables, setCables, addCableAndPersist, selectedCableId, setSelectedCableId, handleCablePointerDown]
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
    </UiProvider>
  );
}
