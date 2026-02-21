import { useCallback, useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { useCableDrag } from "./useCableDrag";
import { useCanvasInteractions } from "./useCanvasInteractions";
import { useCanvasZoomPan } from "./useCanvasZoomPan";
import { useObjectDrag } from "./useObjectDrag";
import type { Offset } from "../lib/vector";
import type { Cable, CanvasObjectType } from "../types";

type SetObjects = (
  action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]),
  saveToHistory?: boolean
) => void;

type SetCables = (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory?: boolean) => void;

interface UseCanvasInteractionOrchestratorOptions {
  objects: CanvasObjectType[];
  cables: Cable[];
  setObjects: SetObjects;
  setCables: SetCables;
  initialZoom?: number;
  initialPan?: Offset;
}

/**
 * Dedicated interaction orchestrator for canvas pan/zoom + object drag + cable drag.
 * Keeps late-bound handler wiring out of AppContext.
 */
export function useCanvasInteractionOrchestrator({
  objects,
  cables,
  setObjects,
  setCables,
  initialZoom,
  initialPan,
}: UseCanvasInteractionOrchestratorOptions) {
  const interactions = useCanvasInteractions();
  const {
    setHandlers,
    handleObjectPointerDown,
    handleCanvasPointerDown: onCanvasPointerDown,
    handleCablePointerDown,
  } = interactions;

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
    initialZoom,
    initialPan,
    onPinchStart: interactions.onPinchStart,
  });

  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent) => onCanvasPointerDown(e, spaceDown),
    [onCanvasPointerDown, spaceDown]
  );

  const { draggingObjectId, handleObjectDragStart, clearDragState: clearObjectDragState } = useObjectDrag(
    objects,
    setObjects,
    zoom,
    spaceDown
  );
  const { handleCableDragStart, clearDragState: clearCableDragState } = useCableDrag(cables, setCables, zoom, spaceDown);

  useEffect(() => {
    setHandlers({
      objectDragStart: handleObjectDragStart,
      cableDragStart: handleCableDragStart,
      clearObjectDrag: clearObjectDragState,
      clearCableDrag: clearCableDragState,
      canvasPanPointerDown,
    });
  }, [setHandlers, handleObjectDragStart, handleCableDragStart, clearObjectDragState, clearCableDragState, canvasPanPointerDown]);

  return {
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
  };
}
