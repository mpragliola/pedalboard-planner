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
import { useCallback, useRef, useState } from "react";

export type Selection =
  | { kind: "object"; id: string }
  | { kind: "cable"; id: string }
  | null;

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
  // ── Selection state ────────────────────────────────────────────────────
  const [selection, setSelection] = useState<Selection>(null);

  const selectedObjectIds = selection?.kind === "object" ? [selection.id] : [];
  const selectedCableId = selection?.kind === "cable" ? selection.id : null;

  const setSelectedObjectIds = useCallback(
    (action: string[] | ((prev: string[]) => string[])) => {
      setSelection((prev) => {
        const prevIds = prev?.kind === "object" ? [prev.id] : [];
        const nextIds = typeof action === "function" ? action(prevIds) : action;
        const nextId = nextIds[0] ?? null;
        return nextId ? { kind: "object", id: nextId } : null;
      });
    },
    []
  );

  const setSelectedCableId = useCallback(
    (action: string | null | ((prev: string | null) => string | null)) => {
      setSelection((prev) => {
        const prevId = prev?.kind === "cable" ? prev.id : null;
        const nextId = typeof action === "function" ? action(prevId) : action;
        return nextId ? { kind: "cable", id: nextId } : null;
      });
    },
    []
  );

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
    []
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent, spaceDown: boolean) => {
      if (e.button === 0 && !spaceDown) {
        const hit = (e.target as Element | null)?.closest(SELECTABLE_SELECTOR);
        if (!hit) setSelection(null);
      }
      hRef.current?.canvasPanPointerDown(e);
    },
    []
  );

  const handleCablePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      setSelection({ kind: "cable", id });
      hRef.current?.cableDragStart(id, e);
    },
    []
  );

  return {
    selection, setSelection,
    selectedObjectIds, setSelectedObjectIds,
    selectedCableId, setSelectedCableId,
    setHandlers,
    onPinchStart,
    handleObjectPointerDown,
    handleCanvasPointerDown,
    handleCablePointerDown,
  };
}
