import { useState, useCallback, useRef, useMemo } from "react";
import { vec2Abs, vec2Sub } from "../lib/vector";
import type { Point } from "../lib/vector";

export type Segment = { x1: number; y1: number; x2: number; y2: number };

export interface PolylineDrawState {
  segments: Segment[];
  segmentStart: Point | null;
  currentEnd: Point | null;
}

export interface PolylineDrawHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}

export interface UsePolylineDrawResult extends PolylineDrawState, PolylineDrawHandlers {
  committedLength: number;
  currentLength: number;
  totalLength: number;
  hasSegments: boolean;
  hasPreview: boolean;
}

const MIN_SEGMENT_LENGTH = 0.5;

/**
 * Manages polyline drawing state (click + move): segments, current segment start/end,
 * and pointer handlers. Does not handle coordinate conversion or exit (ESC/double-click).
 * Segments are committed on pointer up (after click or drag).
 */
export function usePolylineDraw(
  clientToCanvas: (clientX: number, clientY: number) => Point,
  onDoubleClickExit?: () => void
): UsePolylineDrawResult {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentStart, setSegmentStart] = useState<Point | null>(null);
  const [currentEnd, setCurrentEnd] = useState<Point | null>(null);
  const pointerDownRef = useRef<Point | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.nativeEvent as MouseEvent).detail === 2) {
        onDoubleClickExit?.();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const point = clientToCanvas(e.clientX, e.clientY);
      pointerDownRef.current = point;
      if (!segmentStart) {
        setSegmentStart(point);
        setCurrentEnd(point);
      }
    },
    [clientToCanvas, segmentStart, onDoubleClickExit]
  );

  /** Constrain point to horizontal or vertical from start (whichever is closer to raw). */
  const constrainToAxis = useCallback(
    (start: Point, raw: Point): Point => {
      const delta = vec2Abs(vec2Sub(raw, start));
      return delta.y < delta.x ? { x: raw.x, y: start.y } : { x: start.x, y: raw.y };
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!segmentStart) return;
      const raw = clientToCanvas(e.clientX, e.clientY);
      const end = e.ctrlKey ? constrainToAxis(segmentStart, raw) : raw;
      setCurrentEnd(end);
    },
    [clientToCanvas, segmentStart, constrainToAxis]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = null;
      if (!segmentStart || !currentEnd) return;
      const raw = clientToCanvas(e.clientX, e.clientY);
      const releasePoint = e.ctrlKey ? constrainToAxis(segmentStart, raw) : raw;
      const len = Math.hypot(releasePoint.x - segmentStart.x, releasePoint.y - segmentStart.y);
      if (len > MIN_SEGMENT_LENGTH) {
        setSegments((prev) => [
          ...prev,
          {
            x1: segmentStart.x,
            y1: segmentStart.y,
            x2: releasePoint.x,
            y2: releasePoint.y,
          },
        ]);
      }
      setSegmentStart(releasePoint);
      setCurrentEnd(releasePoint);
    },
    [clientToCanvas, segmentStart, currentEnd, constrainToAxis]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDoubleClickExit?.();
    },
    [onDoubleClickExit]
  );

  const committedLength = useMemo(
    () => segments.reduce((sum, s) => sum + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0),
    [segments]
  );
  const currentLength =
    segmentStart && currentEnd ? Math.hypot(currentEnd.x - segmentStart.x, currentEnd.y - segmentStart.y) : 0;
  const totalLength = committedLength + currentLength;

  return {
    segments,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onDoubleClick,
    committedLength,
    currentLength,
    totalLength,
    hasSegments: segments.length > 0,
    hasPreview: segmentStart !== null && currentEnd !== null,
  };
}
