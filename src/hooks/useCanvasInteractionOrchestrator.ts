import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useCableDrag } from "./useCableDrag";
import { useCanvasInteractions } from "./useCanvasInteractions";
import { useCanvasZoomPan } from "./useCanvasZoomPan";
import { useCanvasGestureCoordinator } from "./useCanvasGestureCoordinator";
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
  const gesture = useCanvasGestureCoordinator();
  // Gesture subscribers may be registered before drag hooks are created,
  // so refs always point to the latest clear handlers.
  const clearObjectDragRef = useRef<() => void>(() => {});
  const clearCableDragRef = useRef<() => void>(() => {});

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
    gesture,
  });

  const { draggingObjectId, handleObjectDragStart, clearDragState: clearObjectDragState } = useObjectDrag(
    objects,
    setObjects,
    zoom,
    spaceDown
  );
  const { handleCableDragStart, clearDragState: clearCableDragState } = useCableDrag(cables, setCables, zoom, spaceDown);
  // Keep refs synchronized every render so pinch-start always clears current drag handlers.
  clearObjectDragRef.current = clearObjectDragState;
  clearCableDragRef.current = clearCableDragState;

  useEffect(() => {
    // Observer-style gesture coordination:
    // pinch start broadcasts once, and interested interactions react independently.
    const unsubscribe = gesture.subscribeType("pinch-start", () => {
      clearObjectDragRef.current();
      clearCableDragRef.current();
    });
    return unsubscribe;
  }, [gesture]);

  // Inject explicit handler dependencies (no late-bound setHandlers/hRef path).
  const { handleObjectPointerDown, handleCanvasPointerDown: onCanvasPointerDown, handleCablePointerDown } =
    useCanvasInteractions({
      objectDragStart: handleObjectDragStart,
      cableDragStart: handleCableDragStart,
      canvasPanPointerDown,
    });

  const handleCanvasPointerDown = useCallback(
    // Keep spaceDown check at the orchestration boundary so mediator stays stateless.
    (e: ReactPointerEvent) => onCanvasPointerDown(e, spaceDown),
    [onCanvasPointerDown, spaceDown]
  );

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
    gesture,
  };
}
