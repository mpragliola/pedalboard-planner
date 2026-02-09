import { useState, useCallback, useRef, useMemo } from "react";
import { vec2ConstrainToAxis, vec2Length, vec2Sub } from "../lib/vector";
import type { Point } from "../lib/vector";

export type PolylinePoints = Point[];

export interface PolylineDrawState {
  points: PolylinePoints;
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
  const [points, setPoints] = useState<PolylinePoints>([]);
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

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!segmentStart) return;
      const raw = clientToCanvas(e.clientX, e.clientY);
      const end = e.ctrlKey ? vec2ConstrainToAxis(segmentStart, raw) : raw;
      setCurrentEnd(end);
    },
    [clientToCanvas, segmentStart]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = null;
      if (!segmentStart || !currentEnd) return;
      const raw = clientToCanvas(e.clientX, e.clientY);
      const releasePoint = e.ctrlKey ? vec2ConstrainToAxis(segmentStart, raw) : raw;
      const len = vec2Length(vec2Sub(releasePoint, segmentStart));
      if (len > MIN_SEGMENT_LENGTH) {
        setPoints((prev) => {
          if (prev.length === 0) {
            return [segmentStart, releasePoint];
          }
          return [...prev, releasePoint];
        });
      }
      setSegmentStart(releasePoint);
      setCurrentEnd(releasePoint);
    },
    [clientToCanvas, segmentStart, currentEnd]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDoubleClickExit?.();
    },
    [onDoubleClickExit]
  );

  const committedLength = useMemo(() => {
    if (points.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < points.length; i += 1) {
      sum += vec2Length(vec2Sub(points[i], points[i - 1]));
    }
    return sum;
  }, [points]);
  const currentLength =
    segmentStart && currentEnd ? vec2Length(vec2Sub(currentEnd, segmentStart)) : 0;
  const totalLength = committedLength + currentLength;

  return {
    points,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onDoubleClick,
    committedLength,
    currentLength,
    totalLength,
    hasSegments: points.length >= 2,
    hasPreview: segmentStart !== null && currentEnd !== null,
  };
}
