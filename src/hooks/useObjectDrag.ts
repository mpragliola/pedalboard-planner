import { useState, useCallback, useEffect, useRef } from "react";
import type { CanvasObjectType } from "../types";

const DRAG_THRESHOLD_PX = 6;

export function useObjectDrag(
  objects: CanvasObjectType[],
  setObjects: (
    action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]),
    saveToHistory?: boolean
  ) => void,
  zoom: number,
  spaceDown: boolean
) {
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null);
  const [pendingDrag, setPendingDrag] = useState<{
    id: string;
    pointerId: number;
    mouseX: number;
    mouseY: number;
    objX: number;
    objY: number;
  } | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; objX: number; objY: number } | null>(null);
  const dragTargetIdsRef = useRef<Set<string>>(new Set());
  const draggingPointerIdRef = useRef<number | null>(null);
  const hasPushedHistoryRef = useRef(false);

  const getObjectsToDrag = useCallback((): string[] => {
    const ids = dragTargetIdsRef.current;
    return ids.size ? Array.from(ids) : [];
  }, []);

  const handleObjectDragStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (e.button !== 0 || spaceDown) return;
      if (dragTargetIdsRef.current.size > 0) return;
      e.preventDefault();
      e.stopPropagation();
      const obj = objects.find((o) => o.id === id);
      if (!obj) return;
      setPendingDrag({ id, pointerId: e.pointerId, mouseX: e.clientX, mouseY: e.clientY, objX: obj.x, objY: obj.y });
    },
    [objects, spaceDown]
  );

  const clearDragState = useCallback(() => {
    setPendingDrag(null);
    draggingPointerIdRef.current = null;
    if (dragTargetIdsRef.current.size === 0) return;
    dragTargetIdsRef.current = new Set();
    dragStartRef.current = null;
    setDraggingObjectId(null);
    hasPushedHistoryRef.current = false;
  }, []);

  const handleObjectPositionUpdate = useCallback(
    (id: string, x: number, y: number, saveToHistory = false) => {
      setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, x, y } : o)), saveToHistory);
    },
    [setObjects]
  );

  const handleObjectsPositionUpdate = useCallback(
    (updates: Array<{ id: string; x: number; y: number }>, saveToHistory = false) => {
      if (updates.length === 0) return;
      setObjects((prev) => {
        const byId = new Map(updates.map((u) => [u.id, u]));
        return prev.map((o) => {
          const u = byId.get(o.id);
          return u ? { ...o, x: u.x, y: u.y } : o;
        });
      }, saveToHistory);
    },
    [setObjects]
  );

  useEffect(() => {
    if (!pendingDrag) return;
    const pointerId = pendingDrag.pointerId;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (!pendingDrag) return;
      const dx = e.clientX - pendingDrag.mouseX;
      const dy = e.clientY - pendingDrag.mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < DRAG_THRESHOLD_PX) return;
      const newX = pendingDrag.objX + dx / zoom;
      const newY = pendingDrag.objY + dy / zoom;
      dragTargetIdsRef.current = new Set([pendingDrag.id]);
      draggingPointerIdRef.current = pointerId;
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        objX: newX,
        objY: newY,
      };
      hasPushedHistoryRef.current = true;
      setDraggingObjectId(pendingDrag.id);
      setPendingDrag(null);
      handleObjectPositionUpdate(pendingDrag.id, newX, newY, true);
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
  }, [pendingDrag, zoom, handleObjectPositionUpdate]);

  useEffect(() => {
    if (!draggingObjectId) return;
    const handlePointerMove = (e: PointerEvent) => {
      if (draggingPointerIdRef.current !== null && e.pointerId !== draggingPointerIdRef.current) return;
      const ids = getObjectsToDrag();
      if (ids.length === 0 || !dragStartRef.current) return;

      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
      const newX = dragStartRef.current.objX + dx;
      const newY = dragStartRef.current.objY + dy;

      const saveToHistory = !hasPushedHistoryRef.current;
      if (saveToHistory) {
        hasPushedHistoryRef.current = true;
      }

      if (ids.length === 1) {
        handleObjectPositionUpdate(ids[0], newX, newY, saveToHistory);
      } else {
        handleObjectsPositionUpdate(
          ids.map((id) => ({ id, x: newX, y: newY })),
          saveToHistory
        );
      }
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
  }, [
    draggingObjectId,
    zoom,
    getObjectsToDrag,
    clearDragState,
    handleObjectPositionUpdate,
    handleObjectsPositionUpdate,
    setObjects,
  ]);

  return {
    draggingObjectId,
    handleObjectDragStart,
    clearDragState,
  };
}
