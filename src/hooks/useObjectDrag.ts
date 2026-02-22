import { useCallback, useRef } from "react";
import type { CanvasObjectType } from "../types";
import type { Point } from "../lib/vector";
import { useDragState } from "./useDragState";

export function useObjectDrag(
  objects: CanvasObjectType[],
  setObjectsWithHistory: (
    action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[])
  ) => void,
  setObjectsSilent: (
    action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[])
  ) => void,
  zoom: number,
  spaceDown: boolean
) {
  const dragTargetIdsRef = useRef<Set<string>>(new Set());

  const getObjectsToDrag = useCallback((): string[] => {
    const ids = dragTargetIdsRef.current;
    return ids.size ? Array.from(ids) : [];
  }, []);

  const handleObjectPositionUpdate = useCallback(
    (id: string, pos: Point, shouldSaveToHistory = false) => {
      const action = (prev: CanvasObjectType[]) => prev.map((o) => (o.id === id ? { ...o, pos } : o));
      if (shouldSaveToHistory) {
        setObjectsWithHistory(action);
      } else {
        setObjectsSilent(action);
      }
    },
    [setObjectsWithHistory, setObjectsSilent]
  );

  const handleObjectsPositionUpdate = useCallback(
    (updates: Array<{ id: string; pos: Point }>, shouldSaveToHistory = false) => {
      if (updates.length === 0) return;
      const action = (prev: CanvasObjectType[]) => {
        const byId = new Map(updates.map((u) => [u.id, u]));
        return prev.map((o) => {
          const u = byId.get(o.id);
          return u ? { ...o, pos: u.pos } : o;
        });
      };
      if (shouldSaveToHistory) {
        setObjectsWithHistory(action);
      } else {
        setObjectsSilent(action);
      }
    },
    [setObjectsWithHistory, setObjectsSilent]
  );

  const { draggingId: draggingObjectId, handleDragStart, clearDragState } = useDragState<{ objPos: Point }>({
    zoom,
    spaceDown,
    canStart: () => dragTargetIdsRef.current.size === 0,
    getPendingPayload: (id) => {
      const obj = objects.find((o) => o.id === id);
      if (!obj) return null;
      return { objPos: obj.pos };
    },
    onDragActivated: ({ pending, canvasDelta, event }) => {
      const newX = pending.payload.objPos.x + canvasDelta.x;
      const newY = pending.payload.objPos.y + canvasDelta.y;
      dragTargetIdsRef.current = new Set([pending.id]);
      handleObjectPositionUpdate(pending.id, { x: newX, y: newY }, true);
      return {
        mouse: { x: event.clientX, y: event.clientY },
        payload: { objPos: { x: newX, y: newY } },
      };
    },
    onDragMove: ({ dragStart, canvasDelta }) => {
      const ids = getObjectsToDrag();
      if (ids.length === 0) return;
      const newX = dragStart.payload.objPos.x + canvasDelta.x;
      const newY = dragStart.payload.objPos.y + canvasDelta.y;
      if (ids.length === 1) {
        handleObjectPositionUpdate(ids[0], { x: newX, y: newY }, false);
      } else {
        handleObjectsPositionUpdate(
          ids.map((id) => ({ id, pos: { x: newX, y: newY } })),
          false
        );
      }
    },
    onDragEnd: () => {
      if (dragTargetIdsRef.current.size === 0) return;
      dragTargetIdsRef.current = new Set();
    },
  });

  return {
    draggingObjectId,
    handleObjectDragStart: handleDragStart,
    clearDragState,
  };
}
