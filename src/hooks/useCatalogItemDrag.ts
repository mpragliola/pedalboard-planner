import { useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
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
}

/** CSS class added briefly when drag starts (visual feedback) */
const ACTIVATED_CLASS = "catalog-item-activated";

/**
 * Hook for catalog item click-to-drag behavior.
 * Pointer down starts the drag immediately; move updates ghost position; pointer up drops (or cancels).
 * Uses a single pointer capture for the entire interaction to avoid handoff gaps on mobile.
 */
export function useCatalogItemDrag({
  catalogMode,
  defaultWidthMm = 100,
  defaultDepthMm = 100,
}: UseCatalogItemDragOptions) {
  const { startCatalogDrag, endCatalogDrag, setCatalogDragPosition } = useApp();
  const cleanupRef = useRef<() => void>(() => {});
  const targetRef = useRef<HTMLButtonElement | null>(null);

  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, opt: CatalogItemDragOption) => {
      if (e.button !== 0) return;
      e.preventDefault();
      cleanupRef.current();

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* setPointerCapture can throw if pointer is already captured */
      }

      targetRef.current = e.currentTarget;
      const pointerId = e.pointerId;
      const pos = { x: e.clientX, y: e.clientY };

      targetRef.current.classList.add(ACTIVATED_CLASS);
      setTimeout(() => targetRef.current?.classList.remove(ACTIVATED_CLASS), 200);

      const imageUrl = opt.image ? `${imageBase}${opt.image}` : null;
      const widthMm = opt.widthMm ?? defaultWidthMm;
      const depthMm = opt.depthMm ?? defaultDepthMm;
      startCatalogDrag(opt.id, catalogMode, imageUrl, pointerId, pos.x, pos.y, widthMm, depthMm);

      const { release } = capturePointerWithPosition(pointerId, {
        initialPosition: pos,
        preventDefaultOnMove: true,
        onMove: (movePos) => {
          setCatalogDragPosition({ x: movePos.x, y: movePos.y });
        },
        onEnd: (endPos) => {
          cleanupRef.current();
          endCatalogDrag(endPos.x, endPos.y);
        },
      });

      cleanupRef.current = () => release();
    },
    [catalogMode, imageBase, startCatalogDrag, endCatalogDrag, setCatalogDragPosition, defaultWidthMm, defaultDepthMm]
  );

  return { handlePointerDown, imageBase };
}
