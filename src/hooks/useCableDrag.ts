import { useCallback } from "react";
import type { Cable } from "../types";
import { vec2Add, type Point } from "../lib/vector";
import { useDragState } from "./useDragState";

function offsetPoints(points: Point[], offset: Point): Point[] {
  return points.map((point) => vec2Add(point, offset));
}

export function useCableDrag(
  cables: Cable[],
  setCables: (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory?: boolean) => void,
  zoom: number,
  spaceDown: boolean
) {
  const handleCableSegmentsUpdate = useCallback(
    (id: string, segments: Point[], saveToHistory = false) => {
      setCables((prev) => prev.map((c) => (c.id === id ? { ...c, segments } : c)), saveToHistory);
    },
    [setCables]
  );

  const { draggingId: draggingCableId, handleDragStart, clearDragState } = useDragState<{ segments: Point[] }>({
    zoom,
    spaceDown,
    getPendingPayload: (id) => {
      const cable = cables.find((c) => c.id === id);
      if (!cable) return null;
      return { segments: cable.segments };
    },
    onDragActivated: ({ pending, canvasDelta, event }) => {
      handleCableSegmentsUpdate(pending.id, offsetPoints(pending.payload.segments, canvasDelta), true);
      return {
        mouse: { x: event.clientX, y: event.clientY },
        payload: { segments: pending.payload.segments },
      };
    },
    onDragMove: ({ draggingId, dragStart, canvasDelta, saveToHistory }) => {
      handleCableSegmentsUpdate(
        draggingId,
        offsetPoints(dragStart.payload.segments, canvasDelta),
        saveToHistory
      );
    },
  });

  return {
    draggingCableId,
    handleCableDragStart: handleDragStart,
    clearDragState,
  };
}
