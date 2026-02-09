import { useCallback, useEffect, useRef, useState } from "react";
import { vec2Length, vec2Scale, vec2Sub, type Point } from "../lib/vector";

export interface DragStart<T> {
  mouse: Point;
  payload: T;
}

interface PendingDrag<T> extends DragStart<T> {
  id: string;
  pointerId: number;
}

export interface DragActivateContext<T> {
  pending: PendingDrag<T>;
  screenDelta: Point;
  canvasDelta: Point;
  event: PointerEvent;
}

export interface DragMoveContext<T> {
  draggingId: string;
  dragStart: DragStart<T>;
  screenDelta: Point;
  canvasDelta: Point;
  event: PointerEvent;
  saveToHistory: boolean;
}

export interface UseDragStateOptions<T> {
  zoom: number;
  spaceDown: boolean;
  thresholdPx?: number;
  activateOnStart?: boolean;
  canStart?: (id: string, e: React.PointerEvent) => boolean;
  getPendingPayload: (id: string, e: React.PointerEvent) => T | null;
  onDragActivated: (ctx: DragActivateContext<T>) => DragStart<T> | null;
  onDragMove: (ctx: DragMoveContext<T>) => void;
  onDragEnd?: () => void;
}

export function useDragState<T>(options: UseDragStateOptions<T>) {
  const {
    zoom,
    spaceDown,
    thresholdPx = 6,
    activateOnStart = false,
    canStart,
    getPendingPayload,
    onDragActivated,
    onDragMove,
    onDragEnd,
  } = options;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pendingDrag, setPendingDrag] = useState<PendingDrag<T> | null>(null);
  const dragStartRef = useRef<DragStart<T> | null>(null);
  const draggingPointerIdRef = useRef<number | null>(null);
  const hasPushedHistoryRef = useRef(false);

  const clearDragState = useCallback(() => {
    setPendingDrag(null);
    draggingPointerIdRef.current = null;
    dragStartRef.current = null;
    setDraggingId(null);
    hasPushedHistoryRef.current = false;
    onDragEnd?.();
  }, [onDragEnd]);

  const handleDragStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (e.button !== 0 || spaceDown) return;
      if (draggingId || pendingDrag) return;
      if (canStart && !canStart(id, e)) return;
      const payload = getPendingPayload(id, e);
      if (!payload) return;
      e.preventDefault();
      e.stopPropagation();
      if (activateOnStart) {
        const pending = {
          id,
          pointerId: e.pointerId,
          mouse: { x: e.clientX, y: e.clientY },
          payload,
        };
        const dragStart = onDragActivated({
          pending,
          screenDelta: { x: 0, y: 0 },
          canvasDelta: { x: 0, y: 0 },
          event: e.nativeEvent as PointerEvent,
        });
        if (!dragStart) return;
        draggingPointerIdRef.current = e.pointerId;
        dragStartRef.current = dragStart;
        hasPushedHistoryRef.current = true;
        setDraggingId(id);
        return;
      }
      setPendingDrag({
        id,
        pointerId: e.pointerId,
        mouse: { x: e.clientX, y: e.clientY },
        payload,
      });
    },
    [activateOnStart, canStart, draggingId, pendingDrag, getPendingPayload, onDragActivated, spaceDown]
  );

  useEffect(() => {
    if (!pendingDrag) return;
    const pointerId = pendingDrag.pointerId;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const screenDelta = vec2Sub({ x: e.clientX, y: e.clientY }, pendingDrag.mouse);
      if (vec2Length(screenDelta) < thresholdPx) return;
      const canvasDelta = vec2Scale(screenDelta, 1 / zoom);
      draggingPointerIdRef.current = pointerId;
      const dragStart = onDragActivated({
        pending: pendingDrag,
        screenDelta,
        canvasDelta,
        event: e,
      });
      if (!dragStart) return;
      dragStartRef.current = dragStart;
      hasPushedHistoryRef.current = true;
      setDraggingId(pendingDrag.id);
      setPendingDrag(null);
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
  }, [pendingDrag, thresholdPx, zoom, onDragActivated]);

  useEffect(() => {
    if (!draggingId) return;
    const handlePointerMove = (e: PointerEvent) => {
      if (draggingPointerIdRef.current !== null && e.pointerId !== draggingPointerIdRef.current) return;
      if (!dragStartRef.current) return;
      const screenDelta = vec2Sub({ x: e.clientX, y: e.clientY }, dragStartRef.current.mouse);
      const canvasDelta = vec2Scale(screenDelta, 1 / zoom);
      const saveToHistory = !hasPushedHistoryRef.current;
      if (saveToHistory) {
        hasPushedHistoryRef.current = true;
      }
      onDragMove({
        draggingId,
        dragStart: dragStartRef.current,
        screenDelta,
        canvasDelta,
        event: e,
        saveToHistory,
      });
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
  }, [draggingId, zoom, onDragMove, clearDragState]);

  return {
    draggingId,
    handleDragStart,
    clearDragState,
  };
}
