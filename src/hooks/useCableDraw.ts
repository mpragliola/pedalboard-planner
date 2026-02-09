import { useCallback, type MutableRefObject } from "react";
import { snapToObjects } from "../lib/snapToBoundingBox";
import { vec2ConstrainTo45 } from "../lib/vector";
import type { Point } from "../lib/vector";
import type { CanvasObjectType } from "../types";
import { usePolylineDraw, type UsePolylineDrawResult } from "./usePolylineDraw";

export interface UseCableDrawOptions {
  clientToCanvas: (clientX: number, clientY: number) => Point;
  objects: CanvasObjectType[];
  getObjectDimensions: (o: CanvasObjectType) => [number, number, number];
  onDoubleClickExit?: () => void;
  /** Ref to callback when user clicks within tolerance of the last point (to finish the cable). */
  onFinishClickRef?: MutableRefObject<(() => void) | undefined>;
}

/** If click release is within this distance (mm) of the last vertex and we have segments, treat as "finish". */
const FINISH_CLICK_TOLERANCE_MM = 15;

export type UseCableDrawResult = UsePolylineDrawResult;

/**
 * Polyline drawing with snap-to-object bounding boxes (SHIFT disables snap)
 * and 45-degree angle constraint (CTRL). Thin wrapper around usePolylineDraw.
 */
export function useCableDraw({
  clientToCanvas,
  objects,
  getObjectDimensions,
  onDoubleClickExit,
  onFinishClickRef,
}: UseCableDrawOptions): UseCableDrawResult {
  const resolvePoint = useCallback(
    (raw: Point, shiftKey: boolean) =>
      shiftKey ? raw : snapToObjects(raw.x, raw.y, objects, getObjectDimensions),
    [objects, getObjectDimensions]
  );

  return usePolylineDraw({
    clientToCanvas,
    resolvePoint,
    constrainPoint: vec2ConstrainTo45,
    onDoubleClickExit,
    onFinishClickRef,
    finishClickTolerance: FINISH_CLICK_TOLERANCE_MM,
  });
}
