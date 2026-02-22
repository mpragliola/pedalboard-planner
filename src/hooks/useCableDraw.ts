import { useCallback, useMemo, type MutableRefObject } from "react";
import { vec2ConstrainTo45 } from "../lib/vector";
import type { Point } from "../lib/vector";
import type { CanvasObjectType } from "../types";
import {
  createConditionalSnapStrategy,
  createIdentitySnapStrategy,
  createObjectSnapStrategy,
  type ModifierSnapContext,
  type ObjectSnapContext,
} from "../lib/snapStrategies";
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

type CableDrawSnapContext = ModifierSnapContext & ObjectSnapContext;

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
  // Snap policy is explicit and swappable:
  // - SHIFT bypasses all snapping
  // - otherwise snap to nearest object boundary
  const snapStrategy = useMemo(
    () =>
      createConditionalSnapStrategy<CableDrawSnapContext>(
        (context) => context.shiftKey,
        createIdentitySnapStrategy<CableDrawSnapContext>(),
        createObjectSnapStrategy<CableDrawSnapContext>()
      ),
    []
  );

  const resolvePoint = useCallback(
    (raw: Point, shiftKey: boolean) =>
      snapStrategy.snap(raw, {
        shiftKey,
        objects,
        getObjectDimensions,
      }),
    [snapStrategy, objects, getObjectDimensions]
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
