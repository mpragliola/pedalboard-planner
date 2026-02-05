import { useMemo } from "react";
import { buildRoundedPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import type { Cable } from "../../types";
import "./CablePaths.css";

const CABLE_STROKE_WIDTH_MM = 5;
/** Extra stroke width for selected cable halo (mm), so halo = CABLE_STROKE_WIDTH_MM + 2 * HALO_EXTRA_MM. */
const HALO_EXTRA_MM = 4;
const SELECTED_CABLE_HALO_COLOR = "rgba(10, 132, 255, 0.7)";
const ENDPOINT_DOT_RADIUS = 4;
/** Canvas-space SVG extent (covers -CANVAS_HALF..CANVAS_HALF) so cables stay visible when panning. */
const CANVAS_HALF = 2500;
const CANVAS_SIZE = CANVAS_HALF * 2;

/** Hit area stroke width (mm) – invisible path for easier clicking. */
const HIT_STROKE_MM = 16;

/** Distance from anchor to connector label (mm). */
const LABEL_OFFSET_MM = 10;

function normalize(x: number, y: number): { x: number; y: number } | null {
  const len = Math.hypot(x, y);
  if (len < 1e-6) return null;
  return { x: x / len, y: y / len };
}

/** Connector label position and text for one cable endpoint. */
interface ConnectorLabel {
  x: number;
  y: number;
  text: string;
}

/** Compute connector label positions: opposite to the cable direction at each anchor. */
function connectorLabelsForCable(cable: Cable): { a: ConnectorLabel; b: ConnectorLabel } | null {
  const segs = cable.segments;
  if (segs.length === 0) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const firstPt = { x: first.x1, y: first.y1 };
  const lastPt = { x: last.x2, y: last.y2 };
  const firstDir = normalize(first.x2 - first.x1, first.y2 - first.y1);
  const lastDir = normalize(last.x2 - last.x1, last.y2 - last.y1);
  if (!firstDir || !lastDir) return null;
  const textA = (cable.connectorAName ?? "").trim();
  const textB = (cable.connectorBName ?? "").trim();
  return {
    a: {
      x: firstPt.x - firstDir.x * LABEL_OFFSET_MM,
      y: firstPt.y - firstDir.y * LABEL_OFFSET_MM,
      text: textA,
    },
    b: {
      x: lastPt.x + lastDir.x * LABEL_OFFSET_MM,
      y: lastPt.y + lastDir.y * LABEL_OFFSET_MM,
      text: textB,
    },
  };
}

interface CablePathsProps {
  cables: Cable[];
  visible: boolean;
  selectedCableId: string | null;
  onCablePointerDown: (id: string, e: React.PointerEvent) => void;
}

/**
 * Renders cables in canvas (world) coordinates inside the viewport so they
 * pan and zoom smoothly with the same CSS transform as the rest of the canvas.
 */
export function CablePaths({ cables, visible, selectedCableId, onCablePointerDown }: CablePathsProps) {
  const { paths, endpoints, connectorLabels } = useMemo(() => {
    const joinRadius = DEFAULT_JOIN_RADIUS;
    const paths: { id: string; d: string; color: string }[] = [];
    const endpointSet = new Set<string>();
    const endpoints: { x: number; y: number }[] = [];
    const connectorLabels: { id: string; a: ConnectorLabel; b: ConnectorLabel }[] = [];

    for (const cable of cables) {
      if (cable.segments.length === 0) continue;
      const points = [
        { x: cable.segments[0].x1, y: cable.segments[0].y1 },
        ...cable.segments.map((s) => ({ x: s.x2, y: s.y2 })),
      ];
      const d = buildRoundedPathD(points, joinRadius);
      paths.push({ id: cable.id, d, color: cable.color });
      const labels = connectorLabelsForCable(cable);
      if (labels) connectorLabels.push({ id: cable.id, ...labels });
      const first = points[0];
      const last = points[points.length - 1];
      const key = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
      if (!endpointSet.has(key(first.x, first.y))) {
        endpointSet.add(key(first.x, first.y));
        endpoints.push(first);
      }
      if (!endpointSet.has(key(last.x, last.y))) {
        endpointSet.add(key(last.x, last.y));
        endpoints.push(last);
      }
    }

    return { paths, endpoints, connectorLabels };
  }, [cables]);

  if (!visible || cables.length === 0) return null;

  return (
    <svg
      className="cable-paths-svg"
      viewBox={`${-CANVAS_HALF} ${-CANVAS_HALF} ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: -CANVAS_HALF,
        top: -CANVAS_HALF,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        pointerEvents: visible ? "stroke" : "none",
        zIndex: 1000,
      }}
    >
      {paths.map((p) => (
        <g key={p.id}>
          {/* Invisible wide stroke for hit area */}
          <path
            d={p.d}
            fill="none"
            stroke="transparent"
            strokeWidth={HIT_STROKE_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ cursor: "pointer" }}
            onPointerDown={(e) => onCablePointerDown(p.id, e)}
          />
          {/* Thicker stroke behind cable when selected – always visible, no filter */}
          {selectedCableId === p.id && (
            <path
              d={p.d}
              fill="none"
              stroke={SELECTED_CABLE_HALO_COLOR}
              strokeWidth={CABLE_STROKE_WIDTH_MM + 2 * HALO_EXTRA_MM}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ pointerEvents: "none" }}
            />
          )}
          <path
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={CABLE_STROKE_WIDTH_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pointerEvents: "none" }}
          />
        </g>
      ))}
      {endpoints.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={ENDPOINT_DOT_RADIUS}
          className="cable-endpoint-dot"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(0, 0, 0, 0.25)"
          strokeWidth="1"
        />
      ))}
      {connectorLabels.map(({ id, a, b }) => (
        <g key={`labels-${id}`} className="cable-connector-labels" style={{ pointerEvents: "none" }}>
          {a.text ? (
            <text
              x={a.x}
              y={a.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="cable-connector-label"
            >
              {a.text}
            </text>
          ) : null}
          {b.text ? (
            <text
              x={b.x}
              y={b.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="cable-connector-label"
            >
              {b.text}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
