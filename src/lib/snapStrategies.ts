import { snapToObjects } from "./snapToBoundingBox";
import type { CanvasObjectType } from "../types";
import type { Point } from "./vector";

/**
 * Strategy contract for any snapping behavior.
 * Implementations may use context (modifiers, scene data, tolerances) to transform a point.
 */
export interface SnapStrategy<TContext> {
  snap: (point: Point, context: TContext) => Point;
}

/** Shared context for object-boundary snapping. */
export interface ObjectSnapContext {
  objects: CanvasObjectType[];
  getObjectDimensions: (object: CanvasObjectType) => [number, number, number];
  toleranceMm?: number;
}

/** Shared context for modifier-aware snapping decisions. */
export interface ModifierSnapContext {
  shiftKey: boolean;
  metaKey?: boolean;
}

/** Identity strategy: leaves point untouched. Useful as explicit "no snap" branch. */
export function createIdentitySnapStrategy<TContext>(): SnapStrategy<TContext> {
  return {
    snap: (point) => point,
  };
}

/**
 * Object-edge snapping strategy.
 * Snaps to nearest object perimeter point within tolerance.
 */
export function createObjectSnapStrategy<TContext extends ObjectSnapContext>(): SnapStrategy<TContext> {
  return {
    snap: (point, context) =>
      snapToObjects(
        point.x,
        point.y,
        context.objects,
        context.getObjectDimensions,
        context.toleranceMm
      ),
  };
}

/**
 * Grid snapping strategy (rounds to nearest grid step).
 * Not wired by default, but can be composed into chains when needed.
 */
export function createGridSnapStrategy<TContext>(gridSize: number): SnapStrategy<TContext> {
  return {
    snap: (point) => ({
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    }),
  };
}

/**
 * Conditional strategy selector.
 * Chooses one of two strategies per event context (e.g. modifier override).
 */
export function createConditionalSnapStrategy<TContext>(
  predicate: (context: TContext) => boolean,
  whenTrue: SnapStrategy<TContext>,
  whenFalse: SnapStrategy<TContext>
): SnapStrategy<TContext> {
  return {
    snap: (point, context) =>
      (predicate(context) ? whenTrue : whenFalse).snap(point, context),
  };
}

/**
 * Chained strategy composition.
 * Output of each strategy becomes input of the next, so policies can be stacked.
 */
export function createChainedSnapStrategy<TContext>(
  strategies: SnapStrategy<TContext>[]
): SnapStrategy<TContext> {
  return {
    snap: (point, context) =>
      strategies.reduce((currentPoint, strategy) => strategy.snap(currentPoint, context), point),
  };
}

