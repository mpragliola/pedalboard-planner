import {
  CABLE_PATHS_LABEL_ICON_GAP_MM,
  CABLE_PATHS_LABEL_ICON_SIZE_MM,
  CABLE_PATHS_LABEL_TERMINAL_CLEARANCE_MM,
  CABLE_PATHS_LABEL_TEXT_CHAR_WIDTH_MM,
  CABLE_PATHS_LABEL_TEXT_LINE_HEIGHT_MM,
  CABLE_PATHS_LABEL_TEXT_MIN_WIDTH_MM,
  CABLE_PATHS_MIN_SEGMENT_LENGTH,
} from "../constants/cablePaths";
import type { Cable } from "../types";
import {
  vec2Add,
  vec2Length,
  vec2Normalize,
  vec2Scale,
  vec2Sub,
  type Offset,
  type Point,
} from "./vector";

/** Connector label geometry and text for one cable endpoint. */
export interface ConnectorLabel {
  labelPosition: Point;
  iconPosition: Point;
  text: string;
  kind: Cable["connectorA"];
}

function estimateLabelTextWidthMm(text: string): number {
  return Math.max(CABLE_PATHS_LABEL_TEXT_MIN_WIDTH_MM, text.trim().length * CABLE_PATHS_LABEL_TEXT_CHAR_WIDTH_MM);
}

function computeConnectorLabelLayout(anchor: Point, awayDir: Offset, trimmedText: string): { center: Point; topY: number } {
  const groupWidth = Math.max(CABLE_PATHS_LABEL_ICON_SIZE_MM, estimateLabelTextWidthMm(trimmedText));
  const groupHeight =
    CABLE_PATHS_LABEL_TEXT_LINE_HEIGHT_MM + CABLE_PATHS_LABEL_ICON_GAP_MM + CABLE_PATHS_LABEL_ICON_SIZE_MM;
  const halfProjectedExtent =
    (groupWidth * 0.5) * Math.abs(awayDir.x) + (groupHeight * 0.5) * Math.abs(awayDir.y);
  const center = vec2Add(
    anchor,
    vec2Scale(awayDir, CABLE_PATHS_LABEL_TERMINAL_CLEARANCE_MM + halfProjectedExtent)
  );
  return { center, topY: center.y - groupHeight * 0.5 };
}

function buildConnectorLabel(anchor: Point, awayDir: Offset, text: string, kind: Cable["connectorA"]): ConnectorLabel {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      labelPosition: anchor,
      iconPosition: anchor,
      text: "",
      kind,
    };
  }

  const { center, topY } = computeConnectorLabelLayout(anchor, awayDir, trimmed);
  return {
    labelPosition: { x: center.x, y: topY + CABLE_PATHS_LABEL_TEXT_LINE_HEIGHT_MM * 0.5 },
    iconPosition: {
      x: center.x - CABLE_PATHS_LABEL_ICON_SIZE_MM * 0.5,
      y: topY + CABLE_PATHS_LABEL_TEXT_LINE_HEIGHT_MM + CABLE_PATHS_LABEL_ICON_GAP_MM,
    },
    text: trimmed,
    kind,
  };
}

/** Compute connector label positions: opposite to the cable direction at each anchor. */
export function connectorLabelsForCable(cable: Cable): { a: ConnectorLabel; b: ConnectorLabel } | null {
  const points = cable.segments;
  if (points.length < 2) return null;
  const firstStart = points[0];
  const firstEnd = points[1];
  const lastStart = points[points.length - 2];
  const lastEnd = points[points.length - 1];
  const firstVector = vec2Sub(firstEnd, firstStart);
  const lastVector = vec2Sub(lastEnd, lastStart);
  if (vec2Length(firstVector) < CABLE_PATHS_MIN_SEGMENT_LENGTH || vec2Length(lastVector) < CABLE_PATHS_MIN_SEGMENT_LENGTH) {
    return null;
  }

  const firstDir = vec2Normalize(firstVector);
  const lastDir = vec2Normalize(lastVector);
  return {
    a: buildConnectorLabel(firstStart, vec2Scale(firstDir, -1), cable.connectorAName ?? "", cable.connectorA),
    b: buildConnectorLabel(lastEnd, lastDir, cable.connectorBName ?? "", cable.connectorB),
  };
}
