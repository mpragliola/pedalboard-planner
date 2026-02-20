/**
 * Canvas interaction mediator.
 *
 * Coordinates pointer-down handlers that span multiple concerns
 * (object drag, cable drag, pan, selection) and ensures mutual
 * exclusion (e.g. pinch clears all drags, clicking empty canvas
 * deselects).
 *
 * Call order in AppContext:
 *   1. useCanvasInteractions()  → provides onPinchStart (ref-stable)
 *   2. useCanvasZoomPan({ onPinchStart })
 *   3. useObjectDrag / useCableDrag
 *   4. interactions.setHandlers(...)  → late-bind drag handlers
 */
import { useCallback, useRef } from "react";
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
  clearObjectDrag: () => void;
  clearCableDrag: () => void;
  canvasPanPointerDown: (e: React.PointerEvent) => void;
}

export function useCanvasInteractions() {
  const { setSelection } = useSelection();

  // ── Late-bound handlers (set after drag hooks are created) ────────────
  const hRef = useRef<Handlers | null>(null);

  const setHandlers = useCallback((h: Handlers) => {
    hRef.current = h;
  }, []);

  // ── Coordinated pointer-down callbacks ────────────────────────────────

  /** Stable callback for useCanvasZoomPan's onPinchStart. */
  const onPinchStart = useCallback(() => {
    hRef.current?.clearObjectDrag();
    hRef.current?.clearCableDrag();
  }, []);

  const handleObjectPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      setSelection({ kind: "object", id });
      hRef.current?.objectDragStart(id, e);
    },
    [setSelection]
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent, spaceDown: boolean) => {
      if (e.button === 0 && !spaceDown) {
        const hit = (e.target as Element | null)?.closest(SELECTABLE_SELECTOR);
        if (!hit) setSelection(null);
      }
      hRef.current?.canvasPanPointerDown(e);
    },
    [setSelection]
  );

  const handleCablePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      setSelection({ kind: "cable", id });
      hRef.current?.cableDragStart(id, e);
    },
    [setSelection]
  );

  return {
    setHandlers,
    onPinchStart,
    handleObjectPointerDown,
    handleCanvasPointerDown,
    handleCablePointerDown,
  };
}
