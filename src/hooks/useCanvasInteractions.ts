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
  objectDragStart: (id: string, e: React.PointerEvent) => void;
  cableDragStart: (id: string, e: React.PointerEvent) => void;
  canvasPanPointerDown: (e: React.PointerEvent) => void;
}

export function useCanvasInteractions({ objectDragStart, cableDragStart, canvasPanPointerDown }: Handlers) {
  const { setSelection } = useSelection();

  const handleObjectPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      setSelection({ kind: "object", id });
      objectDragStart(id, e);
    },
    [setSelection, objectDragStart]
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent, spaceDown: boolean) => {
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
      e.stopPropagation();
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
