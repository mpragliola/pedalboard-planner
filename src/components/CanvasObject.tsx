import type { RefObject } from "react";
import { DEFAULT_OBJECT_COLOR, BASE_URL } from "../constants";
import { getObjectDimensions } from "../lib/stateManager";
import type { CanvasObjectType } from "../types";
import "./CanvasObject.css";

/** Resolve image URL so relative paths work from app root (e.g. when BASE_URL is set). */
function imageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}

interface CanvasObjectProps {
  obj: CanvasObjectType;
  stackIndex: number;
  useImage: boolean;
  isDragging: boolean;
  isSelected: boolean;
  opacity: number;
  canvasRef: RefObject<HTMLDivElement | null>;
  onImageError: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onDragEnd: () => void;
}

function tooltipText(obj: CanvasObjectType): string {
  const parts = [
    obj.type && `Type: ${obj.type}`,
    obj.brand && `Brand: ${obj.brand}`,
    obj.model && `Model: ${obj.model}`,
  ].filter(Boolean);
  return parts.join(" · ") || obj.name;
}

const normalizeRotation = (r: number) => ((r % 360) + 360) % 360;

const STACK_BASE = 1;
const STACK_DRAGGING = 10000;

export function CanvasObject({
  obj,
  stackIndex,
  useImage,
  isDragging,
  isSelected,
  opacity,
  canvasRef,
  onImageError,
  onPointerDown,
  onDragEnd,
}: CanvasObjectProps) {
  const [width, depth] = getObjectDimensions(obj);
  const rotation = normalizeRotation(obj.rotation ?? 0);
  const is90or270 = rotation === 90 || rotation === 270;
  const bboxW = is90or270 ? depth : width;
  const bboxH = is90or270 ? width : depth;
  const wrapperLeft = obj.x + (width - bboxW) / 2;
  const wrapperTop = obj.y + (depth - bboxH) / 2;
  const boxLeft = (bboxW - width) / 2;
  const boxTop = (bboxH - depth) / 2;
  /* Stacking by array order only; drag boost so dragged item stays on top. */
  const zIndex = (isDragging ? STACK_DRAGGING : 0) + STACK_BASE + stackIndex;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault(); /* prevent scroll/zoom on touch so drag works */
    /* Capture on canvas container so it isn't lost when the object moves (fixes drag on real phones) */
    canvasRef.current?.setPointerCapture(e.pointerId);
    onPointerDown(e);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (isDragging) onDragEnd();
  };
  return (
    <div
      className={`canvas-object-wrapper ${isDragging ? "canvas-object-wrapper-dragging" : ""}`}
      style={{
        position: "absolute",
        left: wrapperLeft,
        top: wrapperTop,
        width: bboxW,
        height: bboxH,
        zIndex,
        opacity,
      }}
      title={tooltipText(obj)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`canvas-object ${useImage ? "has-image" : "has-color"} ${
          isDragging ? "canvas-object-dragging" : ""
        } ${isSelected ? "canvas-object-selected" : ""}`}
        style={{
          position: "absolute",
          left: boxLeft,
          top: boxTop,
          width,
          height: depth,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "50% 50%",
          backgroundColor: useImage ? "transparent" : obj.color ?? DEFAULT_OBJECT_COLOR,
        }}
      >
        {useImage && obj.image ? (
          <img
            src={imageSrc(obj.image)}
            alt=""
            className="canvas-object-image"
            draggable={false}
            onError={onImageError}
          />
        ) : null}
      </div>
    </div>
  );
}
