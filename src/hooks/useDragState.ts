import { useCallback, useEffect, useRef, useState } from "react";
import { vec2Length, vec2Scale, vec2Sub, type Point } from "../lib/vector";

export interface DragStart<T> {
  mouse: Point;
  payload: T;
}

export interface DragActivateContext<T> {
  pending: { id: string; pointerId: number; mouse: Point; payload: T };
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

// ── State machine ──────────────────────────────────────────────────────
// Exactly one of these is active at any time. Impossible states are
// unrepresentable: you can't be "pending" and "dragging" simultaneously,
// and phase-specific fields only exist on the phase that uses them.

type Phase<T> =
  | { tag: "idle" }
  | { tag: "pending"; id: string; pointerId: number; mouse: Point; payload: T }
  | { tag: "dragging"; id: string; pointerId: number; start: DragStart<T>; hasPushedHistory: boolean };

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

  const phaseRef = useRef<Phase<T>>({ tag: "idle" });
  // Render trigger: mirrors phaseRef.tag so effects and consumers react to transitions.
  const [phaseTag, setPhaseTag] = useState<"idle" | "pending" | "dragging">("idle");
  const draggingId = phaseRef.current.tag === "dragging" ? phaseRef.current.id : null;

  const clearDragState = useCallback(() => {
    phaseRef.current = { tag: "idle" };
    setPhaseTag("idle");
    onDragEnd?.();
  }, [onDragEnd]);

  const handleDragStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (e.button !== 0 || spaceDown) return;
      if (phaseRef.current.tag !== "idle") return;
      if (canStart && !canStart(id, e)) return;
      const payload = getPendingPayload(id, e);
      if (!payload) return;
      e.preventDefault();
      e.stopPropagation();

      const pending = { id, pointerId: e.pointerId, mouse: { x: e.clientX, y: e.clientY }, payload };

      if (activateOnStart) {
        const dragStart = onDragActivated({
          pending,
          screenDelta: { x: 0, y: 0 },
          canvasDelta: { x: 0, y: 0 },
          event: e.nativeEvent as PointerEvent,
        });
        if (!dragStart) return;
        phaseRef.current = { tag: "dragging", id, pointerId: e.pointerId, start: dragStart, hasPushedHistory: true };
        setPhaseTag("dragging");
        return;
      }

      phaseRef.current = { tag: "pending", ...pending };
      setPhaseTag("pending");
    },
    [activateOnStart, canStart, getPendingPayload, onDragActivated, spaceDown]
  );

  // ── Pending phase: listen for threshold movement to activate ─────────
  useEffect(() => {
    if (phaseTag !== "pending") return;
    const p = phaseRef.current;
    if (p.tag !== "pending") return;
    const pointerId = p.pointerId;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const cur = phaseRef.current;
      if (cur.tag !== "pending") return;
      const screenDelta = vec2Sub({ x: e.clientX, y: e.clientY }, cur.mouse);
      if (vec2Length(screenDelta) < thresholdPx) return;
      const canvasDelta = vec2Scale(screenDelta, 1 / zoom);
      const dragStart = onDragActivated({
        pending: cur,
        screenDelta,
        canvasDelta,
        event: e,
      });
      if (!dragStart) return;
      phaseRef.current = { tag: "dragging", id: cur.id, pointerId, start: dragStart, hasPushedHistory: true };
      setPhaseTag("dragging");
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      phaseRef.current = { tag: "idle" };
      setPhaseTag("idle");
    };

    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true });
    window.addEventListener("pointercancel", handlePointerUp, { capture: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("pointercancel", handlePointerUp, { capture: true });
    };
  }, [phaseTag, thresholdPx, zoom, onDragActivated]);

  // ── Dragging phase: relay movement, end on pointer up ────────────────
  useEffect(() => {
    if (phaseTag !== "dragging") return;

    const handlePointerMove = (e: PointerEvent) => {
      const cur = phaseRef.current;
      if (cur.tag !== "dragging" || e.pointerId !== cur.pointerId) return;
      const screenDelta = vec2Sub({ x: e.clientX, y: e.clientY }, cur.start.mouse);
      const canvasDelta = vec2Scale(screenDelta, 1 / zoom);
      const saveToHistory = !cur.hasPushedHistory;
      if (saveToHistory) cur.hasPushedHistory = true;
      onDragMove({
        draggingId: cur.id,
        dragStart: cur.start,
        screenDelta,
        canvasDelta,
        event: e,
        saveToHistory,
      });
    };
    const handlePointerUp = (e: PointerEvent) => {
      const cur = phaseRef.current;
      if (cur.tag !== "dragging" || e.pointerId !== cur.pointerId) return;
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
  }, [phaseTag, zoom, onDragMove, clearDragState]);

  return {
    draggingId,
    handleDragStart,
    clearDragState,
  };
}
