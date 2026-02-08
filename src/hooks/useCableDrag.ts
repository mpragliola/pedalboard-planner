import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Cable } from "../types";
import { vec2Add, vec2Length, vec2Scale, vec2Sub, type Point } from "../lib/vector";

const DRAG_THRESHOLD_PX = 6;

function offsetPoints(points: Point[], offset: Point): Point[] {
  return points.map((point) => vec2Add(point, offset));
}

export function useCableDrag(
  cables: Cable[],
  setCables: (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory?: boolean) => void,
  zoom: number,
  spaceDown: boolean
) {
  const [draggingCableId, setDraggingCableId] = useState<string | null>(null);
  const [pendingDrag, setPendingDrag] = useState<{
    id: string;
    pointerId: number;
    mouse: Point;
    segments: Point[];
  } | null>(null);
  const dragStartRef = useRef<{ mouse: Point; segments: Point[] } | null>(null);
  const draggingPointerIdRef = useRef<number | null>(null);
  const hasPushedHistoryRef = useRef(false);

  const handleCableSegmentsUpdate = useCallback(
    (id: string, segments: Point[], saveToHistory = false) => {
      setCables((prev) => prev.map((c) => (c.id === id ? { ...c, segments } : c)), saveToHistory);
    },
    [setCables]
  );

  const handleCableDragStart = useCallback(
    (id: string, e: ReactPointerEvent) => {
      if (e.button !== 0 || spaceDown) return;
      if (draggingCableId || pendingDrag) return;
      const cable = cables.find((c) => c.id === id);
      if (!cable) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingDrag({
        id,
        pointerId: e.pointerId,
        mouse: { x: e.clientX, y: e.clientY },
        segments: cable.segments,
      });
    },
    [cables, spaceDown, draggingCableId, pendingDrag]
  );

  const clearDragState = useCallback(() => {
    setPendingDrag(null);
    draggingPointerIdRef.current = null;
    dragStartRef.current = null;
    setDraggingCableId(null);
    hasPushedHistoryRef.current = false;
  }, []);

  useEffect(() => {
    if (!pendingDrag) return;
    const pointerId = pendingDrag.pointerId;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const screenDelta = vec2Sub({ x: e.clientX, y: e.clientY }, pendingDrag.mouse);
      if (vec2Length(screenDelta) < DRAG_THRESHOLD_PX) return;
      const canvasDelta = vec2Scale(screenDelta, 1 / zoom);
      draggingPointerIdRef.current = pointerId;
      dragStartRef.current = {
        mouse: { x: e.clientX, y: e.clientY },
        segments: pendingDrag.segments,
      };
      hasPushedHistoryRef.current = true;
      setDraggingCableId(pendingDrag.id);
      setPendingDrag(null);
      handleCableSegmentsUpdate(
        pendingDrag.id,
        offsetPoints(pendingDrag.segments, canvasDelta),
        true
      );
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      setPendingDrag(null);
    };
    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true });
    window.addEventListener("pointercancel", handlePointerUp, { capture: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("pointercancel", handlePointerUp, { capture: true });
    };
  }, [pendingDrag, zoom, handleCableSegmentsUpdate]);

  useEffect(() => {
    if (!draggingCableId) return;
    const handlePointerMove = (e: PointerEvent) => {
      if (draggingPointerIdRef.current !== null && e.pointerId !== draggingPointerIdRef.current) return;
      if (!dragStartRef.current) return;
      const screenDelta = vec2Sub({ x: e.clientX, y: e.clientY }, dragStartRef.current.mouse);
      const canvasDelta = vec2Scale(screenDelta, 1 / zoom);
      const saveToHistory = !hasPushedHistoryRef.current;
      if (saveToHistory) hasPushedHistoryRef.current = true;
      handleCableSegmentsUpdate(
        draggingCableId,
        offsetPoints(dragStartRef.current.segments, canvasDelta),
        saveToHistory
      );
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (draggingPointerIdRef.current !== null && e.pointerId !== draggingPointerIdRef.current) return;
      clearDragState();
    };
    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true });
    window.addEventListener("pointercancel", handlePointerUp, { capture: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("pointercancel", handlePointerUp, { capture: true });
    };
  }, [draggingCableId, zoom, handleCableSegmentsUpdate, clearDragState]);

  return {
    draggingCableId,
    handleCableDragStart,
    clearDragState,
  };
}
