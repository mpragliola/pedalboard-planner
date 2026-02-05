import { useMemo } from "react";
import { buildRoundedPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import type { Cable } from "../../types";

const CABLE_STROKE_WIDTH_MM = 5;
const ENDPOINT_DOT_RADIUS = 4;
/** Canvas-space SVG extent (covers -CANVAS_HALF..CANVAS_HALF) so cables stay visible when panning. */
const CANVAS_HALF = 2500;
const CANVAS_SIZE = CANVAS_HALF * 2;

/** Hit area stroke width (mm) – invisible path for easier clicking. */
const HIT_STROKE_MM = 16;

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
  const { paths, endpoints } = useMemo(() => {
    const joinRadius = DEFAULT_JOIN_RADIUS;
    const paths: { id: string; d: string; color: string }[] = [];
    const endpointSet = new Set<string>();
    const endpoints: { x: number; y: number }[] = [];

    for (const cable of cables) {
      if (cable.segments.length === 0) continue;
      const points = [
        { x: cable.segments[0].x1, y: cable.segments[0].y1 },
        ...cable.segments.map((s) => ({ x: s.x2, y: s.y2 })),
      ];
      const d = buildRoundedPathD(points, joinRadius);
      paths.push({ id: cable.id, d, color: cable.color });
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

    return { paths, endpoints };
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
          <path
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={CABLE_STROKE_WIDTH_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              pointerEvents: "none",
              opacity: selectedCableId === p.id ? 1 : undefined,
              filter: selectedCableId === p.id ? "drop-shadow(0 0 4px rgba(10, 132, 255, 0.6))" : undefined,
            }}
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
    </svg>
  );
}
