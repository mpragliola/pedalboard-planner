import type { Point } from "./vector";

export interface CableDragState {
  cableId: string;
  points: Point[];
  handleIndex: number;
}

export interface CableSegment {
  start: Point;
  end: Point;
}

export interface CableDragDerived {
  dragCableId: string | null;
  dragHandleIndex: number | null;
  dragPoints: Point[] | null;
  dragSegA: CableSegment | null;
  dragSegB: CableSegment | null;
  dragSegBForPath: CableSegment | null;
}

/**
 * Derive the currently dragged cable/handle and neighboring segments used by
 * physics preview and path splitting.
 */
export function deriveCableDragState(dragState: CableDragState | null): CableDragDerived {
  const dragCableId = dragState?.cableId ?? null;
  const dragHandleIndex = dragState?.handleIndex ?? null;
  const dragPoints = dragState?.points ?? null;

  const dragSegA =
    dragPoints && dragHandleIndex !== null && dragHandleIndex > 0
      ? { start: dragPoints[dragHandleIndex - 1], end: dragPoints[dragHandleIndex] }
      : null;
  const dragSegB =
    dragPoints && dragHandleIndex !== null && dragHandleIndex < dragPoints.length - 1
      ? { start: dragPoints[dragHandleIndex + 1], end: dragPoints[dragHandleIndex] }
      : null;
  const dragSegBForPath =
    dragPoints && dragHandleIndex !== null && dragHandleIndex < dragPoints.length - 1
      ? { start: dragPoints[dragHandleIndex], end: dragPoints[dragHandleIndex + 1] }
      : null;

  return { dragCableId, dragHandleIndex, dragPoints, dragSegA, dragSegB, dragSegBForPath };
}
