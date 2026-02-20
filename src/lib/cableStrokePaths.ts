import { buildRoundedPathD, buildSmoothPathD } from "./polylinePath";
import type { CableSegment } from "./cableDrag";
import type { Point } from "./vector";

export interface BuildCablePathDataParams {
  activePoints: Point[];
  joinRadius: number;
  isDraggedCable: boolean;
  dragHandleIndex: number | null;
  dragSegA: CableSegment | null;
  dragSegBForPath: CableSegment | null;
  physicsPointsA: Point[];
  physicsPointsB: Point[];
}

export interface CablePathData {
  hitD: string;
  strokeDs: string[];
}

function buildSegmentPathD(segment: CableSegment | null, physicsPoints: Point[]): string {
  if (!segment) return "";
  if (physicsPoints.length >= 2) return buildSmoothPathD(physicsPoints);
  return `M ${segment.start.x} ${segment.start.y} L ${segment.end.x} ${segment.end.y}`;
}

/**
 * Build hit/stroke paths for one cable, including split + physics-smoothed
 * segments while dragging a middle handle.
 */
export function buildCablePathData({
  activePoints,
  joinRadius,
  isDraggedCable,
  dragHandleIndex,
  dragSegA,
  dragSegBForPath,
  physicsPointsA,
  physicsPointsB,
}: BuildCablePathDataParams): CablePathData {
  const hitD = buildRoundedPathD(activePoints, joinRadius);
  if (!isDraggedCable || dragHandleIndex === null) {
    return { hitD, strokeDs: hitD ? [hitD] : [] };
  }

  const strokeDs: string[] = [];
  const beforePoints = activePoints.slice(0, dragHandleIndex);
  const afterPoints = activePoints.slice(dragHandleIndex + 1);
  if (beforePoints.length >= 2) strokeDs.push(buildRoundedPathD(beforePoints, joinRadius));
  strokeDs.push(buildSegmentPathD(dragSegA, physicsPointsA));
  const physicsPointsBForPath = physicsPointsB.length >= 2 ? [...physicsPointsB].reverse() : physicsPointsB;
  strokeDs.push(buildSegmentPathD(dragSegBForPath, physicsPointsBForPath));
  if (afterPoints.length >= 2) strokeDs.push(buildRoundedPathD(afterPoints, joinRadius));

  return { hitD, strokeDs: strokeDs.filter((d) => d.length > 0) };
}
