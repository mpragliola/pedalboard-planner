import { useCallback, type MutableRefObject, type RefObject } from "react";
import { MM_TO_PX } from "../constants/interaction";
import { DEFAULT_PLACEMENT_FALLBACK } from "../constants/layout";
import { BOARD_TEMPLATES } from "../data/boards";
import { DEVICE_TEMPLATES } from "../data/devices";
import { createCustomObject, createObjectFromTemplate, modeToSubtype, type CustomItemParams } from "../lib/templateHelpers";
import { visibleViewportPlacement } from "../lib/placementStrategy";
import type { ObjectIdGenerator } from "../lib/objectIdGenerator";
import type { Offset, Point } from "../lib/vector";
import type { CanvasObjectType } from "../types";
import { useCatalogDrag } from "./useCatalogDrag";

type CatalogMode = "boards" | "devices";

interface UseCatalogPlacementOptions {
  canvasRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  pan: Offset;
  zoomRef: RefObject<number>;
  panRef: RefObject<Offset>;
  idGeneratorRef: MutableRefObject<ObjectIdGenerator>;
  setObjects: (
    action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]),
    saveToHistory?: boolean
  ) => void;
  clearSelection: () => void;
  setSelectedBoard: (value: string) => void;
  setSelectedDevice: (value: string) => void;
}

function clearModeSelection(mode: CatalogMode, setSelectedBoard: (value: string) => void, setSelectedDevice: (value: string) => void) {
  (mode === "boards" ? setSelectedBoard : setSelectedDevice)("");
}

export function useCatalogPlacement({
  canvasRef,
  zoom,
  pan,
  zoomRef,
  panRef,
  idGeneratorRef,
  setObjects,
  clearSelection,
  setSelectedBoard,
  setSelectedDevice,
}: UseCatalogPlacementOptions) {
  const getPlacementInVisibleViewport = useCallback((): Point => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return DEFAULT_PLACEMENT_FALLBACK;
    return visibleViewportPlacement({
      canvasRect: canvasEl.getBoundingClientRect(),
      pan,
      zoom,
      viewportCenter: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }, [canvasRef, pan, zoom]);

  const addObjectFromTemplate = useCallback(
    (mode: CatalogMode, templateId: string, canvasX: number, canvasY: number) => {
      const id = templateId?.trim();
      if (!id) return;

      const templates = mode === "boards" ? BOARD_TEMPLATES : DEVICE_TEMPLATES;
      const template = templates.find((t) => t.id === id);
      if (!template) return;

      const w = template.wdh[0] * MM_TO_PX;
      const d = template.wdh[1] * MM_TO_PX;
      const newObj = createObjectFromTemplate(
        modeToSubtype(mode),
        template,
        { x: canvasX - w / 2, y: canvasY - d / 2 },
        idGeneratorRef.current
      );

      setObjects((prev) => [...prev, newObj]);
      clearModeSelection(mode, setSelectedBoard, setSelectedDevice);
      clearSelection();
    },
    [idGeneratorRef, setObjects, setSelectedBoard, setSelectedDevice, clearSelection]
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

  const handleCustomCreate = useCallback(
    (mode: CatalogMode, params: CustomItemParams) => {
      const { x: cx, y: cy } = getPlacementInVisibleViewport();
      const w = params.widthMm * MM_TO_PX;
      const d = params.depthMm * MM_TO_PX;
      const newObj = createCustomObject(
        modeToSubtype(mode),
        params,
        { x: cx - w / 2, y: cy - d / 2 },
        idGeneratorRef.current
      );
      setObjects((prev) => [...prev, newObj]);
      clearModeSelection(mode, setSelectedBoard, setSelectedDevice);
      clearSelection();
    },
    [idGeneratorRef, getPlacementInVisibleViewport, setObjects, setSelectedBoard, setSelectedDevice, clearSelection]
  );

  const { placeFromCatalog, shouldIgnoreCatalogClick } = useCatalogDrag({
    canvasRef,
    zoomRef,
    panRef,
    onDropOnCanvas: addObjectFromTemplate,
  });

  return {
    handleBoardSelect,
    handleDeviceSelect,
    handleCustomCreate,
    placeFromCatalog,
    shouldIgnoreCatalogClick,
  };
}
