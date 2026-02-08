import { useState, useCallback, useRef, type MutableRefObject } from "react";
import { snapToObjects } from "../lib/snapToBoundingBox";
import type { CanvasObjectType } from "../types";
import type { Point } from "../lib/vector";

export interface UseCableDrawOptions {
  clientToCanvas: (clientX: number, clientY: number) => Point;
  objects: CanvasObjectType[];
  getObjectDimensions: (o: CanvasObjectType) => [number, number, number];
  onDoubleClickExit?: () => void;
  /** Ref to callback when user clicks within tolerance of the last point (to finish the cable). */
  onFinishClickRef?: MutableRefObject<(() => void) | undefined>;
}

const MIN_SEGMENT_LENGTH = 0.5;
/** If click release is within this distance (mm) of the last vertex and we have segments, treat as "finish". */
const FINISH_CLICK_TOLERANCE_MM = 15;

export interface UseCableDrawResult {
  points: Point[];
  segmentStart: Point | null;
  currentEnd: Point | null;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  /** Returns the points that would be committed (for showing in Add Cable dialog). */
  getFinalPoints: () => Point[];
  /** Clear drawing state (points, segmentStart, currentEnd). */
  clearDrawing: () => void;
  hasSegments: boolean;
  hasPreview: boolean;
}

/** Constrain direction to nearest 45° from start (0°, 45°, 90°, …), keeping distance. */
function constrainTo45Degrees(
  start: Point,
  raw: Point
): Point {
  const dx = raw.x - start.x;
  const dy = raw.y - start.y;
  const angle = Math.atan2(dy, dx);
  const step = Math.PI / 4;
  const snappedAngle = Math.round(angle / step) * step;
  const distance = Math.hypot(dx, dy);
  return {
    x: start.x + distance * Math.cos(snappedAngle),
    y: start.y + distance * Math.sin(snappedAngle),
  };
}

/**
 * Polyline drawing with optional snap to object bounding boxes. SHIFT disables snap. CTRL constrains to 45° angles (horizontal, vertical, diagonals).
 * Double-click exits without persisting (like line ruler). Use addCable() to persist the current polyline.
 */
export function useCableDraw({
  clientToCanvas,
  objects,
  getObjectDimensions,
  onDoubleClickExit,
  onFinishClickRef,
}: UseCableDrawOptions): UseCableDrawResult {
  const [points, setPoints] = useState<Point[]>([]);
  const [segmentStart, setSegmentStart] = useState<Point | null>(null);
  const [currentEnd, setCurrentEnd] = useState<Point | null>(null);
  const pointerDownRef = useRef<Point | null>(null);

  const resolvePoint = useCallback(
    (clientX: number, clientY: number, shiftKey: boolean) => {
      const raw = clientToCanvas(clientX, clientY);
      if (shiftKey) return raw;
      return snapToObjects(raw.x, raw.y, objects, getObjectDimensions);
    },
    [clientToCanvas, objects, getObjectDimensions]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.nativeEvent as MouseEvent).detail === 2) {
        e.preventDefault();
        e.stopPropagation();
      if (points.length >= 2 || segmentStart) {
        onFinishClickRef?.current?.();
      } else {
        onDoubleClickExit?.();
      }
      return;
      }
      e.preventDefault();
      e.stopPropagation();
      const point = resolvePoint(e.clientX, e.clientY, e.shiftKey);
      pointerDownRef.current = point;
      if (!segmentStart) {
        setSegmentStart(point);
        setCurrentEnd(point);
      }
    },
    [resolvePoint, segmentStart, points.length, onDoubleClickExit, onFinishClickRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!segmentStart) return;
      const raw = resolvePoint(e.clientX, e.clientY, e.shiftKey);
      const point = e.ctrlKey ? constrainTo45Degrees(segmentStart, raw) : raw;
      setCurrentEnd(point);
    },
    [resolvePoint, segmentStart]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = null;
      if (!segmentStart || !currentEnd) return;
      const raw = resolvePoint(e.clientX, e.clientY, e.shiftKey);
      const releasePoint = e.ctrlKey ? constrainTo45Degrees(segmentStart, raw) : raw;
      const len = Math.hypot(releasePoint.x - segmentStart.x, releasePoint.y - segmentStart.y);
      // Click near last vertex with at least one segment → treat as "finish" (don't add tiny segment)
      if (points.length >= 2 && len <= FINISH_CLICK_TOLERANCE_MM) {
        onFinishClickRef?.current?.();
        return;
      }
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
    [resolvePoint, segmentStart, currentEnd, points.length, onFinishClickRef]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (points.length >= 2 || (segmentStart && currentEnd)) {
        onFinishClickRef?.current?.();
      } else {
        setPoints([]);
        setSegmentStart(null);
        setCurrentEnd(null);
        onDoubleClickExit?.();
      }
    },
    [points.length, segmentStart, currentEnd, onDoubleClickExit, onFinishClickRef]
  );

  const getFinalPoints = useCallback((): Point[] => {
    const len =
      segmentStart && currentEnd ? Math.hypot(currentEnd.x - segmentStart.x, currentEnd.y - segmentStart.y) : 0;
    if (len <= MIN_SEGMENT_LENGTH) return points;
    if (points.length === 0 && segmentStart && currentEnd) {
      return [segmentStart, currentEnd];
    }
    return segmentStart && currentEnd ? [...points, currentEnd] : points;
  }, [segmentStart, currentEnd, points]);

  const clearDrawing = useCallback(() => {
    setPoints([]);
    setSegmentStart(null);
    setCurrentEnd(null);
  }, []);

  return {
    points,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
    getFinalPoints,
    clearDrawing,
    hasSegments: points.length >= 2,
    hasPreview: segmentStart !== null && currentEnd !== null,
  };
}
