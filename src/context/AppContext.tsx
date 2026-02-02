import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { initialObjects, MM_TO_PX } from "../constants";
import {
  createObjectFromBoardTemplate,
  createObjectFromDeviceTemplate,
  createObjectFromCustomBoard,
  createObjectFromCustomDevice,
  initNextObjectIdFromObjects,
} from "../lib/templateHelpers";
import { StateManager, type SavedState } from "../lib/stateManager";
import { visibleViewportPlacement } from "../lib/placementStrategy";
import { useCanvasZoomPan } from "../hooks/useCanvasZoomPan";
import { useObjectDrag } from "../hooks/useObjectDrag";
import { useBoardDeviceFilters } from "../hooks/useBoardDeviceFilters";
import { useHistory } from "../hooks/useHistory";
import type { CanvasObjectType, Connector } from "../types";

const stateManager = new StateManager("pedal/state");

type CatalogMode = "boards" | "devices";

interface AppContextValue {
  // Refs
  canvasRef: React.RefObject<HTMLDivElement>;
  dropdownPanelRef: React.RefObject<HTMLDivElement>;
  // Canvas / zoom
  zoom: number;
  pan: { x: number; y: number };
  tileSize: number;
  showGrid: boolean;
  setShowGrid: (fn: (v: boolean) => boolean) => void;
  xray: boolean;
  setXray: (fn: (v: boolean) => boolean) => void;
  ruler: boolean;
  setRuler: (fn: (v: boolean) => boolean) => void;
  lineRuler: boolean;
  setLineRuler: (fn: (v: boolean) => boolean) => void;
  unit: "mm" | "in";
  setUnit: (u: "mm" | "in") => void;
  isPanning: boolean;
  spaceDown: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
  canvasAnimating: boolean;
  setCanvasAnimating: (v: boolean) => void;
  handleCanvasPointerDown: (e: React.PointerEvent) => void;
  // Objects
  objects: CanvasObjectType[];
  setObjects: (
    action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]),
    saveToHistory?: boolean
  ) => void;
  selectedObjectIds: string[];
  setSelectedObjectIds: React.Dispatch<React.SetStateAction<string[]>>;
  imageFailedIds: Set<string>;
  draggingObjectId: string | null;
  onImageError: (id: string) => void;
  onObjectPointerDown: (id: string, e: React.PointerEvent) => void;
  onDragEnd: () => void;
  onDeleteObject: (id: string) => void;
  onRotateObject: (id: string) => void;
  onSendToBack: (id: string) => void;
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Catalog
  catalogMode: CatalogMode;
  setCatalogMode: (mode: CatalogMode) => void;
  filters: ReturnType<typeof useBoardDeviceFilters>;
  onBoardSelect: (templateId: string) => void;
  onDeviceSelect: (templateId: string) => void;
  onBoardSelectAt: (templateId: string, canvasX: number, canvasY: number) => void;
  onDeviceSelectAt: (templateId: string, canvasX: number, canvasY: number) => void;
  /** Long-press drag from catalog: state and position for ghost; startCatalogDrag starts it, pointerup ends it. */
  catalogDrag: {
    templateId: string;
    mode: "boards" | "devices";
    imageUrl: string | null;
    widthMm: number;
    depthMm: number;
  } | null;
  catalogDragPosition: { x: number; y: number };
  startCatalogDrag: (
    templateId: string,
    mode: "boards" | "devices",
    imageUrl: string | null,
    clientX: number,
    clientY: number,
    widthMm: number,
    depthMm: number
  ) => void;
  /** Returns true if the last interaction was a catalog drag end (so click handlers should not add). */
  shouldIgnoreCatalogClick: () => boolean;
  onCustomBoardCreate: (params: { widthMm: number; depthMm: number; color: string; name: string }) => void;
  onCustomDeviceCreate: (params: { widthMm: number; depthMm: number; color: string; name: string }) => void;
  // Floating UI visibility
  floatingUiVisible: boolean;
  setFloatingUiVisible: React.Dispatch<React.SetStateAction<boolean>>;
  connectors: Connector[];
  setConnectors: React.Dispatch<React.SetStateAction<Connector[]>>;
  // Pedalboard file: new / load / save
  newBoard: () => void;
  loadBoardFromFile: (file: File) => void;
  saveBoardToFile: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedState] = useState<SavedState | null>(() => {
    const state = stateManager.load();
    if (state?.objects?.length) initNextObjectIdFromObjects(state.objects);
    return state;
  });

  const historyInitial = useMemo(
    () => ({
      objects: savedState?.objects ?? initialObjects,
      past: savedState?.past ?? [],
      future: savedState?.future ?? [],
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps -- only on mount
  );

  const {
    state: objects,
    setState: setObjects,
    replace: replaceHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    past,
    future,
  } = useHistory<CanvasObjectType[]>(historyInitial.objects, 200, {
    initialPast: historyInitial.past,
    initialFuture: historyInitial.future,
  });

  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set());
  const [showGrid, setShowGrid] = useState(false);
  const [xray, setXray] = useState(false);
  const [ruler, setRuler] = useState(false);
  const [lineRuler, setLineRuler] = useState(false);
  const [unit, setUnit] = useState<"mm" | "in">(savedState?.unit ?? "mm");
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("boards");
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [floatingUiVisible, setFloatingUiVisible] = useState(true);
  const [connectors, setConnectors] = useState<Connector[]>(savedState?.connectors ?? []);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  const clearDragStateRef = useRef<() => void>(() => {});

  const {
    zoom,
    pan,
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
  } = useCanvasZoomPan({
    initialZoom: savedState?.zoom,
    initialPan: savedState?.pan,
    onPinchStart: () => clearDragStateRef.current(),
  });

  const { draggingObjectId, handleObjectDragStart, clearDragState } = useObjectDrag(
    objects,
    setObjects,
    zoom,
    spaceDown
  );

  useEffect(() => {
    clearDragStateRef.current = clearDragState;
    return () => {
      clearDragStateRef.current = () => {};
    };
  }, [clearDragState]);

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
      if (e.button === 0 && !spaceDown && !(e.target as Element).closest(".canvas-object-wrapper")) {
        setSelectedObjectIds([]);
      }
      canvasPanPointerDown(e);
    },
    [spaceDown, canvasPanPointerDown]
  );

  const handleImageError = useCallback((id: string) => {
    setImageFailedIds((prev) => new Set(prev).add(id));
  }, []);

  /** Uses placement strategy to compute center of viewport not covered by catalog/board menu. */
  const getPlacementInVisibleViewport = useCallback((): { x: number; y: number } => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return { x: 120, y: 120 };
    return visibleViewportPlacement({
      canvasRect: canvasEl.getBoundingClientRect(),
      pan,
      zoom,
      catalogRect: document.querySelector(".catalog-panel")?.getBoundingClientRect(),
      boardMenuRect: document.querySelector(".board-menu-wrap")?.getBoundingClientRect(),
    });
  }, [pan, zoom, canvasRef]);

  /** Axis-aligned bbox center of all objects. One setPan + CSS transition. */
  const centerView = useCallback(() => {
    const el = canvasRef.current;
    if (!el || objects.length === 0) return;
    const normalizeRotation = (r: number) => ((r % 360) + 360) % 360;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const obj of objects) {
      const rotation = normalizeRotation(obj.rotation ?? 0);
      const is90or270 = rotation === 90 || rotation === 270;
      const bboxW = is90or270 ? obj.depth : obj.width;
      const bboxH = is90or270 ? obj.width : obj.depth;
      const wrapperLeft = obj.x + (obj.width - bboxW) / 2;
      const wrapperTop = obj.y + (obj.depth - bboxH) / 2;
      minX = Math.min(minX, wrapperLeft);
      minY = Math.min(minY, wrapperTop);
      maxX = Math.max(maxX, wrapperLeft + bboxW);
      maxY = Math.max(maxY, wrapperTop + bboxH);
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

  const handleBoardSelect = useCallback(
    (templateId: string) => {
      const id = templateId?.trim();
      if (!id) return;
      const template = BOARD_TEMPLATES.find((t) => t.id === id);
      if (!template) return;
      const { x: cx, y: cy } = getPlacementInVisibleViewport();
      const w = template.wdh[0] * MM_TO_PX;
      const d = template.wdh[1] * MM_TO_PX;
      const newObj = createObjectFromBoardTemplate(template, cx - w / 2, cy - d / 2);
      setObjects((prev) => [...prev, newObj]);
      setSelectedBoard("");
      setSelectedObjectIds([]);
    },
    [setSelectedBoard, setSelectedObjectIds, getPlacementInVisibleViewport, setObjects]
  );

  const handleDeviceSelect = useCallback(
    (templateId: string) => {
      const id = templateId?.trim();
      if (!id) return;
      const template = DEVICE_TEMPLATES.find((t) => t.id === id);
      if (!template) return;
      const { x: cx, y: cy } = getPlacementInVisibleViewport();
      const w = template.wdh[0] * MM_TO_PX;
      const d = template.wdh[1] * MM_TO_PX;
      const newObj = createObjectFromDeviceTemplate(template, cx - w / 2, cy - d / 2);
      setObjects((prev) => [...prev, newObj]);
      setSelectedDevice("");
      setSelectedObjectIds([]);
    },
    [setSelectedDevice, setSelectedObjectIds, getPlacementInVisibleViewport, setObjects]
  );

  const handleBoardSelectAt = useCallback(
    (templateId: string, canvasX: number, canvasY: number) => {
      const id = templateId?.trim();
      if (!id) return;
      const template = BOARD_TEMPLATES.find((t) => t.id === id);
      if (!template) return;
      const w = template.wdh[0] * MM_TO_PX;
      const d = template.wdh[1] * MM_TO_PX;
      const newObj = createObjectFromBoardTemplate(template, canvasX - w / 2, canvasY - d / 2);
      setObjects((prev) => [...prev, newObj]);
      setSelectedBoard("");
      setSelectedObjectIds([]);
    },
    [setSelectedBoard, setSelectedObjectIds, setObjects]
  );

  const handleDeviceSelectAt = useCallback(
    (templateId: string, canvasX: number, canvasY: number) => {
      const id = templateId?.trim();
      if (!id) return;
      const template = DEVICE_TEMPLATES.find((t) => t.id === id);
      if (!template) return;
      const w = template.wdh[0] * MM_TO_PX;
      const d = template.wdh[1] * MM_TO_PX;
      const newObj = createObjectFromDeviceTemplate(template, canvasX - w / 2, canvasY - d / 2);
      setObjects((prev) => [...prev, newObj]);
      setSelectedDevice("");
      setSelectedObjectIds([]);
    },
    [setSelectedDevice, setSelectedObjectIds, setObjects]
  );

  const [catalogDrag, setCatalogDrag] = useState<{
    templateId: string;
    mode: "boards" | "devices";
    imageUrl: string | null;
    widthMm: number;
    depthMm: number;
  } | null>(null);
  const [catalogDragPosition, setCatalogDragPosition] = useState({ x: 0, y: 0 });
  const ignoreNextCatalogClickRef = useRef(false);

  const startCatalogDrag = useCallback(
    (
      templateId: string,
      mode: "boards" | "devices",
      imageUrl: string | null,
      clientX: number,
      clientY: number,
      widthMm: number,
      depthMm: number
    ) => {
      setCatalogDrag({ templateId, mode, imageUrl, widthMm, depthMm });
      setCatalogDragPosition({ x: clientX, y: clientY });
    },
    []
  );

  const shouldIgnoreCatalogClick = useCallback(() => {
    const v = ignoreNextCatalogClickRef.current;
    ignoreNextCatalogClickRef.current = false;
    return v;
  }, []);

  useEffect(() => {
    if (!catalogDrag) return;
    const onMove = (e: PointerEvent) => setCatalogDragPosition({ x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (canvasRef.current && el && canvasRef.current.contains(el)) {
        const r = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - r.left - pan.x) / zoom;
        const y = (e.clientY - r.top - pan.y) / zoom;
        if (catalogDrag.mode === "boards") handleBoardSelectAt(catalogDrag.templateId, x, y);
        else handleDeviceSelectAt(catalogDrag.templateId, x, y);
      }
      ignoreNextCatalogClickRef.current = true;
      setCatalogDrag(null);
    };
    window.addEventListener("pointermove", onMove, { capture: true });
    window.addEventListener("pointerup", onUp, { capture: true });
    window.addEventListener("pointercancel", onUp, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onMove, { capture: true });
      window.removeEventListener("pointerup", onUp, { capture: true });
      window.removeEventListener("pointercancel", onUp, { capture: true });
    };
  }, [catalogDrag, zoom, pan.x, pan.y, handleBoardSelectAt, handleDeviceSelectAt]);

  const handleCustomBoardCreate = useCallback(
    (params: { widthMm: number; depthMm: number; color: string; name: string }) => {
      const { x: cx, y: cy } = getPlacementInVisibleViewport();
      const w = params.widthMm * MM_TO_PX;
      const d = params.depthMm * MM_TO_PX;
      const newObj = createObjectFromCustomBoard(params, cx - w / 2, cy - d / 2);
      setObjects((prev) => [...prev, newObj]);
      setSelectedBoard("");
      setSelectedObjectIds([]);
    },
    [setSelectedBoard, setSelectedObjectIds, getPlacementInVisibleViewport, setObjects]
  );

  const handleCustomDeviceCreate = useCallback(
    (params: { widthMm: number; depthMm: number; color: string; name: string }) => {
      const { x: cx, y: cy } = getPlacementInVisibleViewport();
      const w = params.widthMm * MM_TO_PX;
      const d = params.depthMm * MM_TO_PX;
      const newObj = createObjectFromCustomDevice(params, cx - w / 2, cy - d / 2);
      setObjects((prev) => [...prev, newObj]);
      setSelectedDevice("");
      setSelectedObjectIds([]);
    },
    [setSelectedDevice, setSelectedObjectIds, getPlacementInVisibleViewport, setObjects]
  );

  const handleDeleteObject = useCallback(
    (id: string) => {
      setObjects((prev) => prev.filter((o) => o.id !== id));
      setSelectedObjectIds((prev) => prev.filter((sid) => sid !== id));
      setConnectors((prev) => prev.filter((c) => c.deviceA !== id && c.deviceB !== id));
    },
    [setObjects, setConnectors]
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

  const loadBoardState = useCallback(
    (state: SavedState) => {
      if (state.objects?.length) initNextObjectIdFromObjects(state.objects);
      replaceHistory(state.objects ?? initialObjects, state.past ?? [], state.future ?? []);
      setSelectedObjectIds([]);
      setConnectors(state.connectors ?? []);
      setUnit(state.unit ?? "mm");
      setShowGrid(state.showGrid ?? false);
      if (typeof state.zoom === "number") setZoom(state.zoom);
      if (state.pan && typeof state.pan.x === "number" && typeof state.pan.y === "number") {
        setPan(state.pan);
      }
    },
    [replaceHistory, setZoom, setPan, setConnectors]
  );

  const newBoard = useCallback(() => {
    replaceHistory(initialObjects, [], []);
    setSelectedObjectIds([]);
    setConnectors([]);
    setUnit("mm");
    setShowGrid(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [replaceHistory, setZoom, setPan]);

  const loadBoardFromFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const state = StateManager.parseState(text);
        if (state) loadBoardState(state);
      };
      reader.readAsText(file, "utf-8");
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
      connectors,
    };
    const payload = StateManager.serializeState(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedalboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [objects, zoom, pan, showGrid, unit, connectors]);

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

  // Persist state (and undo history) to localStorage, debounced
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      stateManager.save({
        objects,
        past,
        future,
        zoom,
        pan,
        showGrid,
        unit,
        connectors,
      });
    }, 400);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [objects, past, future, zoom, pan, showGrid, unit, connectors]);

  const value: AppContextValue = {
    canvasRef,
    dropdownPanelRef,
    zoom,
    pan,
    tileSize,
    showGrid,
    setShowGrid,
    xray,
    setXray,
    ruler,
    setRuler,
    lineRuler,
    setLineRuler,
    unit,
    setUnit,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    centerView,
    canvasAnimating,
    setCanvasAnimating,
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
    onBoardSelectAt: handleBoardSelectAt,
    onDeviceSelectAt: handleDeviceSelectAt,
    catalogDrag,
    catalogDragPosition,
    startCatalogDrag,
    shouldIgnoreCatalogClick,
    onCustomBoardCreate: handleCustomBoardCreate,
    onCustomDeviceCreate: handleCustomDeviceCreate,
    floatingUiVisible,
    setFloatingUiVisible,
    connectors,
    setConnectors,
    newBoard,
    loadBoardFromFile,
    saveBoardToFile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
