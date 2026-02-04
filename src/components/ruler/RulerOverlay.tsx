import { useState, useCallback, useRef, useEffect } from "react";
import { DRAG_THRESHOLD_PX } from "../../constants";
import { useApp } from "../../context/AppContext";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { formatLength } from "../../lib/rulerFormat";
import "./RulerOverlay.css";

type Rect = { x1: number; y1: number; x2: number; y2: number };
type DragStart =
  | { clientX: number; clientY: number; x: number; y: number; rect?: undefined }
  | { clientX: number; clientY: number; x: number; y: number; rect: Rect };

export function RulerOverlay() {
  const { canvasRef, zoom, pan, unit, setRuler } = useApp();
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingRect, setIsDraggingRect] = useState(false);
  const dragStartRef = useRef<DragStart | null>(null);
  const hasMovedRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      // If we already have a committed rectangle, start a potential drag (click without move will exit later)
      if (rect && !isDragging) {
        dragStartRef.current = { clientX: e.clientX, clientY: e.clientY, x, y, rect: { ...rect } };
        hasMovedRef.current = false;
        setIsDragging(true);
        setIsDraggingRect(true);
        overlayRef.current?.setPointerCapture(e.pointerId);
        return;
      }
      dragStartRef.current = { clientX: e.clientX, clientY: e.clientY, x, y };
      setIsDragging(true);
      setRect({ x1: x, y1: y, x2: x, y2: y });
      overlayRef.current?.setPointerCapture(e.pointerId);
    },
    [clientToCanvas, rect, isDragging, setRuler]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      if (start.rect) {
        // Moving existing rectangle
        const dist = Math.hypot(e.clientX - start.clientX, e.clientY - start.clientY);
        if (dist >= DRAG_THRESHOLD_PX) hasMovedRef.current = true;
        const dx = x - start.x;
        const dy = y - start.y;
        setRect({
          x1: start.rect.x1 + dx,
          y1: start.rect.y1 + dy,
          x2: start.rect.x2 + dx,
          y2: start.rect.y2 + dy,
        });
      } else {
        setRect({
          x1: start.x,
          y1: start.y,
          x2: x,
          y2: y,
        });
      }
    },
    [clientToCanvas]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      overlayRef.current?.releasePointerCapture(e.pointerId);
      const wasMovingRect = dragStartRef.current?.rect != null;
      const didMove = hasMovedRef.current;
      dragStartRef.current = null;
      setIsDragging(false);
      setIsDraggingRect(false);
      // Only exit ruler when user clicked on existing rect without dragging
      if (wasMovingRect && !didMove) setRuler(() => false);
    },
    [setRuler]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerUpGlobal = (e: PointerEvent) => {
      if (e.button === 0) {
        setIsDragging(false);
        setIsDraggingRect(false);
        dragStartRef.current = null;
      }
    };
    window.addEventListener("pointerup", handlePointerUpGlobal);
    return () => window.removeEventListener("pointerup", handlePointerUpGlobal);
  }, [isDragging]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRuler(() => false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setRuler]);

  const w = rect ? Math.abs(rect.x2 - rect.x1) : 0;
  const h = rect ? Math.abs(rect.y2 - rect.y1) : 0;
  const diagonal = rect ? Math.hypot(w, h) : 0;
  const screenMin = rect ? toScreen(Math.min(rect.x1, rect.x2), Math.min(rect.y1, rect.y2)) : { x: 0, y: 0 };
  const left = screenMin.x;
  const top = screenMin.y;
  const width = w * zoom;
  const height = h * zoom;
  const hasMeasure = w > 0 || h > 0;
  const screenP1 = rect ? toScreen(rect.x1, rect.y1) : { x: 0, y: 0 };
  const screenP2 = rect ? toScreen(rect.x2, rect.y2) : { x: 0, y: 0 };

  return (
    <div
      ref={overlayRef}
      className={`ruler-overlay${isDraggingRect ? " ruler-overlay--grabbing" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {rect && (
        <>
          <div
            className="ruler-rect"
            style={{
              left,
              top,
              width: Math.max(width, 1),
              height: Math.max(height, 1),
            }}
          />
          {hasMeasure && (
            <svg className="ruler-diagonal" style={{ left: 0, top: 0 }}>
              <line x1={screenP1.x} y1={screenP1.y} x2={screenP2.x} y2={screenP2.y} stroke="#e67e22" strokeWidth="2" />
            </svg>
          )}
          {hasMeasure && (
            <div
              className="ruler-popup"
              style={{
                left: left + width / 2,
                top: top - 6,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="ruler-popup-row">
                <span>Width</span>
                <span>{formatLength(w, unit)}</span>
              </div>
              <div className="ruler-popup-row">
                <span>Depth</span>
                <span>{formatLength(h, unit)}</span>
              </div>
              <div className="ruler-popup-row">
                <span>Diagonal</span>
                <span>{formatLength(diagonal, unit)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
