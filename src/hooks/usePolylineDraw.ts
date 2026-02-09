import { useState, useCallback, useRef, useMemo, type MutableRefObject } from "react";
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
  /** Returns the full set of points that would be committed (committed + current segment). */
  getFinalPoints: () => Point[];
  /** Clear all drawing state (points, segmentStart, currentEnd). */
  clearDrawing: () => void;
}

export interface UsePolylineDrawOptions {
  clientToCanvas: (clientX: number, clientY: number) => Point;
  /** Transform a raw canvas point (e.g. snap-to-objects). Default: identity. */
  resolvePoint?: (raw: Point, shiftKey: boolean) => Point;
  /** Constrain angle when CTRL is held. Default: vec2ConstrainToAxis (H/V). */
  constrainPoint?: (start: Point, raw: Point) => Point;
  onDoubleClickExit?: () => void;
  /** Ref to callback invoked when the drawing should be "finished" (e.g. cable: open modal). */
  onFinishClickRef?: MutableRefObject<(() => void) | undefined>;
  /** Distance tolerance (mm) for "finish click" near last vertex. 0 = disabled. Default: 0. */
  finishClickTolerance?: number;
}

const MIN_SEGMENT_LENGTH = 0.5;
const DEFAULT_CONSTRAIN = vec2ConstrainToAxis;
const IDENTITY_RESOLVE = (raw: Point, _shiftKey: boolean) => raw;

export function usePolylineDraw(opts: UsePolylineDrawOptions): UsePolylineDrawResult {
  const {
    clientToCanvas,
    resolvePoint: resolvePointOpt,
    constrainPoint = DEFAULT_CONSTRAIN,
    onDoubleClickExit,
    onFinishClickRef,
    finishClickTolerance = 0,
  } = opts;
  const resolvePoint = resolvePointOpt ?? IDENTITY_RESOLVE;

  const [points, setPoints] = useState<PolylinePoints>([]);
  const [segmentStart, setSegmentStart] = useState<Point | null>(null);
  const [currentEnd, setCurrentEnd] = useState<Point | null>(null);
  const pointerDownRef = useRef<Point | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.nativeEvent as MouseEvent).detail === 2) {
        e.preventDefault();
        e.stopPropagation();
        // Double-click: finish if we have segments and a finish handler, otherwise exit
        if ((points.length >= 2 || segmentStart) && onFinishClickRef?.current) {
          onFinishClickRef.current();
        } else {
          onDoubleClickExit?.();
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const point = resolvePoint(clientToCanvas(e.clientX, e.clientY), e.shiftKey);
      pointerDownRef.current = point;
      if (!segmentStart) {
        setSegmentStart(point);
        setCurrentEnd(point);
      }
    },
    [clientToCanvas, resolvePoint, segmentStart, points.length, onDoubleClickExit, onFinishClickRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!segmentStart) return;
      const raw = resolvePoint(clientToCanvas(e.clientX, e.clientY), e.shiftKey);
      const point = e.ctrlKey ? constrainPoint(segmentStart, raw) : raw;
      setCurrentEnd(point);
    },
    [clientToCanvas, resolvePoint, constrainPoint, segmentStart]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      pointerDownRef.current = null;
      if (!segmentStart || !currentEnd) return;
      const raw = resolvePoint(clientToCanvas(e.clientX, e.clientY), e.shiftKey);
      const releasePoint = e.ctrlKey ? constrainPoint(segmentStart, raw) : raw;
      const len = vec2Length(vec2Sub(releasePoint, segmentStart));
      // Click near last vertex with at least one segment → treat as "finish" (don't add tiny segment)
      if (finishClickTolerance > 0 && points.length >= 2 && len <= finishClickTolerance) {
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
    [clientToCanvas, resolvePoint, constrainPoint, segmentStart, currentEnd, points.length, finishClickTolerance, onFinishClickRef]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if ((points.length >= 2 || (segmentStart && currentEnd)) && onFinishClickRef?.current) {
        onFinishClickRef.current();
      } else {
        onDoubleClickExit?.();
      }
    },
    [points.length, segmentStart, currentEnd, onDoubleClickExit, onFinishClickRef]
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

  const getFinalPoints = useCallback((): Point[] => {
    const len =
      segmentStart && currentEnd ? vec2Length(vec2Sub(currentEnd, segmentStart)) : 0;
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
    onPointerUp,
    onPointerMove,
    onDoubleClick,
    committedLength,
    currentLength,
    totalLength,
    hasSegments: points.length >= 2,
    hasPreview: segmentStart !== null && currentEnd !== null,
    getFinalPoints,
    clearDrawing,
  };
}
