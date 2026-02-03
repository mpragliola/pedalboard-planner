import { useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { LONG_PRESS_MS, MOVE_THRESHOLD_PX } from "../constants";
import { capturePointerWithPosition } from "../lib/pointerCapture";

export interface CatalogItemDragOption {
  id: string;
  image?: string | null;
  widthMm?: number;
  depthMm?: number;
}

interface UseCatalogItemDragOptions {
  catalogMode: "boards" | "devices";
  /** Default width when option.widthMm is undefined */
  defaultWidthMm?: number;
  /** Default depth when option.depthMm is undefined */
  defaultDepthMm?: number;
  /** Called when short tap (not long-press drag) */
  onTap: (id: string) => void;
}

/** CSS class added while pressing (visual feedback) */
const PRESSING_CLASS = "catalog-item-pressing";
/** CSS class added when long-press triggers drag */
const ACTIVATED_CLASS = "catalog-item-activated";

/**
 * Hook for catalog item long-press-to-drag behavior.
 * Uses a SINGLE pointer capture for the entire interaction (press → long-press → drag → drop)
 * to avoid handoff gaps that cause pointercancel on mobile.
 */
export function useCatalogItemDrag({
  catalogMode,
  defaultWidthMm = 100,
  defaultDepthMm = 100,
  onTap,
}: UseCatalogItemDragOptions) {
  const { startCatalogDrag, endCatalogDrag, setCatalogDragPosition } = useApp();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerFiredRef = useRef(false);
  const cleanupRef = useRef<() => void>(() => {});
  const targetRef = useRef<HTMLButtonElement | null>(null);

  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, opt: CatalogItemDragOption) => {
      if (e.button !== 0) return;
      e.preventDefault();
      cleanupRef.current();

      // Capture pointer immediately to prevent pointercancel on mobile
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* setPointerCapture can throw if pointer is already captured */
      }

      timerFiredRef.current = false;
      targetRef.current = e.currentTarget;
      const pointerId = e.pointerId;
      const initialPos = { x: e.clientX, y: e.clientY };

      e.currentTarget.classList.add(PRESSING_CLASS);

      // Single capture for entire flow – no release until pointer up (fixes mobile)
      const { release, getPosition } = capturePointerWithPosition(pointerId, {
        initialPosition: initialPos,
        preventDefaultOnMove: true, // Block browser gestures during hold/drag
        onMove: (pos) => {
          if (timerFiredRef.current) {
            setCatalogDragPosition({ x: pos.x, y: pos.y });
            return;
          }
          if (Math.hypot(pos.x - initialPos.x, pos.y - initialPos.y) > MOVE_THRESHOLD_PX) {
            cleanupRef.current();
            return false;
          }
        },
        onEnd: (pos) => {
          cleanupRef.current();
          if (timerFiredRef.current) {
            endCatalogDrag(pos.x, pos.y);
          } else {
            onTap(opt.id);
          }
        },
      });

      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        targetRef.current?.classList.add(ACTIVATED_CLASS);
        setTimeout(() => targetRef.current?.classList.remove(ACTIVATED_CLASS), 200);

        const pos = getPosition();
        const imageUrl = opt.image ? `${imageBase}${opt.image}` : null;
        const widthMm = opt.widthMm ?? defaultWidthMm;
        const depthMm = opt.depthMm ?? defaultDepthMm;
        // Start drag state only – no second capture; this capture handles move/end
        startCatalogDrag(opt.id, catalogMode, imageUrl, pointerId, pos.x, pos.y, widthMm, depthMm);
      }, LONG_PRESS_MS);

      cleanupRef.current = () => {
        targetRef.current?.classList.remove(PRESSING_CLASS);
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        release();
      };
    },
    [catalogMode, imageBase, startCatalogDrag, endCatalogDrag, setCatalogDragPosition, defaultWidthMm, defaultDepthMm, onTap]
  );

  return { handlePointerDown, imageBase };
}
