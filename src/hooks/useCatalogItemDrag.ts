import { useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";

const LONG_PRESS_MS = 400;
const MOVE_THRESHOLD_PX = 10;

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
  const posRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const cleanupRef = useRef<() => void>(() => {});

  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, opt: CatalogItemDragOption) => {
      if (e.button !== 0) return;
      timerFiredRef.current = false;
      const start = { x: e.clientX, y: e.clientY };
      posRef.current = start;
      initialPosRef.current = start;
      const pointerId = e.pointerId;

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        posRef.current = { x: ev.clientX, y: ev.clientY };
        if (
          Math.hypot(ev.clientX - initialPosRef.current.x, ev.clientY - initialPosRef.current.y) > MOVE_THRESHOLD_PX
        ) {
          cleanupRef.current();
        }
      };

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        cleanupRef.current();
        if (!timerFiredRef.current) onTap(opt.id);
      };

      window.addEventListener("pointermove", onMove, { capture: true });
      window.addEventListener("pointerup", onUp, { capture: true });
      window.addEventListener("pointercancel", onUp, { capture: true });

      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        cleanupRef.current();
        const imageUrl = opt.image ? `${imageBase}${opt.image}` : null;
        const widthMm = opt.widthMm ?? defaultWidthMm;
        const depthMm = opt.depthMm ?? defaultDepthMm;
        startCatalogDrag(
          opt.id,
          catalogMode,
          imageUrl,
          pointerId,
          posRef.current.x,
          posRef.current.y,
          widthMm,
          depthMm
        );
      }, LONG_PRESS_MS);

      cleanupRef.current = () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        window.removeEventListener("pointermove", onMove, { capture: true });
        window.removeEventListener("pointerup", onUp, { capture: true });
        window.removeEventListener("pointercancel", onUp, { capture: true });
      };
    },
    [catalogMode, imageBase, startCatalogDrag, defaultWidthMm, defaultDepthMm, onTap]
  );

  return { handlePointerDown, imageBase };
}
