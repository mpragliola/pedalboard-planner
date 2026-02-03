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
 * Handles pointer events, long-press timer, and initiates catalog drag.
 */
export function useCatalogItemDrag({
  catalogMode,
  defaultWidthMm = 100,
  defaultDepthMm = 100,
  onTap,
}: UseCatalogItemDragOptions) {
  const { startCatalogDrag } = useApp();
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

      timerFiredRef.current = false;
      targetRef.current = e.currentTarget;
      const pointerId = e.pointerId;
      const initialPos = { x: e.clientX, y: e.clientY };

      // Add pressing class for visual feedback
      e.currentTarget.classList.add(PRESSING_CLASS);

      const { release, getPosition } = capturePointerWithPosition(pointerId, {
        initialPosition: initialPos,
        preventDefaultOnMove: false, // Don't prevent - allow scroll detection
        onMove: (pos) => {
          // Cancel if moved too far (user is scrolling, not long-pressing)
          if (Math.hypot(pos.x - initialPos.x, pos.y - initialPos.y) > MOVE_THRESHOLD_PX) {
            cleanupRef.current();
            return false; // Stop tracking
          }
        },
        onEnd: () => {
          const shouldTap = !timerFiredRef.current;
          cleanupRef.current();
          if (shouldTap) onTap(opt.id);
        },
      });

      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        // Add activated class for pulse feedback
        targetRef.current?.classList.add(ACTIVATED_CLASS);
        setTimeout(() => targetRef.current?.classList.remove(ACTIVATED_CLASS), 200);

        const pos = getPosition();
        cleanupRef.current();

        const imageUrl = opt.image ? `${imageBase}${opt.image}` : null;
        const widthMm = opt.widthMm ?? defaultWidthMm;
        const depthMm = opt.depthMm ?? defaultDepthMm;
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
    [catalogMode, imageBase, startCatalogDrag, defaultWidthMm, defaultDepthMm, onTap]
  );

  return { handlePointerDown, imageBase };
}
