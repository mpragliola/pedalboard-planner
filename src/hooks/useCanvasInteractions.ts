/**
 * Canvas interaction mediator.
 *
 * Coordinates pointer-down handlers that span selection + drag start + pan.
 * Handler dependencies are injected as explicit arguments to avoid late-bound
 * refs and hidden initialization order requirements.
 */
import { useCallback } from "react";
import { useSelection } from "../context/SelectionContext";

const SELECTABLE_SELECTOR = [
  ".canvas-object-wrapper",
  ".cable-hit-area",
  ".cable-endpoint-dot",
  ".cable-connector-label",
].join(", ");

interface Handlers {
  /** Starts object drag state machine for the selected object id. */
  objectDragStart: (id: string, e: React.PointerEvent) => void;
  /** Starts cable drag state machine for the selected cable id. */
  cableDragStart: (id: string, e: React.PointerEvent) => void;
  /** Delegates to canvas pan pointer-down logic. */
  canvasPanPointerDown: (e: React.PointerEvent) => void;
}

export function useCanvasInteractions({ objectDragStart, cableDragStart, canvasPanPointerDown }: Handlers) {
  const { setSelection } = useSelection();

  const handleObjectPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      // Selection always updates before drag start so dependent UI stays in sync.
      setSelection({ kind: "object", id });
      objectDragStart(id, e);
    },
    [setSelection, objectDragStart]
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent, spaceDown: boolean) => {
      // Empty left-click clears selection, but never while space-pan mode is active.
      // We still forward every pointer-down to pan logic to keep panning behavior unchanged.
      if (e.button === 0 && !spaceDown) {
        const hit = (e.target as Element | null)?.closest(SELECTABLE_SELECTOR);
        if (!hit) setSelection(null);
      }
      canvasPanPointerDown(e);
    },
    [setSelection, canvasPanPointerDown]
  );

  const handleCablePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      // Prevent canvas-level pointer-down handlers from also treating this as empty-canvas input.
      e.stopPropagation();
      // Selection first, then drag start, mirroring object behavior.
      setSelection({ kind: "cable", id });
      cableDragStart(id, e);
    },
    [setSelection, cableDragStart]
  );

  return {
    handleObjectPointerDown,
    handleCanvasPointerDown,
    handleCablePointerDown,
  };
}
