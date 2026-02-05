import { useRef, useCallback, useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  type DragStartEvent,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { useApp } from "../../context/AppContext";
import { LONG_PRESS_MS, MOVE_THRESHOLD_PX, MM_TO_PX } from "../../constants";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import "./CatalogDragGhost.css";

const CANVAS_DROP_ID = "canvas-drop";
const SAFETY_NET_MS = 8000;

/** Real object size in px (same as on canvas: 1 mm = 1 px). */
function realSizePx(widthMm: number, depthMm: number): { w: number; h: number } {
  return {
    w: Math.round(widthMm * MM_TO_PX),
    h: Math.round(depthMm * MM_TO_PX),
  };
}

export interface CatalogDragData {
  templateId: string;
  mode: "boards" | "devices";
  imageUrl: string | null;
  widthMm: number;
  depthMm: number;
}

function CatalogDragOverlayContent({ data, zoom = 1 }: { data: CatalogDragData; zoom?: number }) {
  const { w: baseW, h: baseH } = realSizePx(data.widthMm, data.depthMm);
  const w = Math.round(baseW * zoom);
  const h = Math.round(baseH * zoom);
  return (
    <div className="catalog-drag-ghost" style={{ width: w, height: h }} aria-hidden>
      {data.imageUrl ? (
        <img src={data.imageUrl} alt="" className="catalog-drag-ghost-image" width={w} height={h} />
      ) : (
        <span className="catalog-drag-ghost-placeholder" style={{ backgroundColor: DEFAULT_OBJECT_COLOR }} />
      )}
    </div>
  );
}

export function CatalogDndProvider({ children }: { children: React.ReactNode }) {
  const { placeFromCatalog, zoom } = useApp();
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [activeData, setActiveData] = useState<CatalogDragData | null>(null);
  /** Pointer position during drag; we position our own ghost from this so it's always centered. */
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: LONG_PRESS_MS,
        tolerance: MOVE_THRESHOLD_PX,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: LONG_PRESS_MS,
        tolerance: MOVE_THRESHOLD_PX,
      },
    })
  );

  const removeListenersRef = useRef<() => void>(() => {});
  const initialPointerRef = useRef<{ x: number; y: number } | null>(null);
  const capturedPointerIdRef = useRef<number | null>(null);

  const captureInitialPointer: Modifier = ({ activatorEvent, transform }) => {
    if (activatorEvent && !initialPointerRef.current) {
      const e = activatorEvent as PointerEvent;
      initialPointerRef.current = { x: e.clientX, y: e.clientY };
    }
    return transform;
  };

  const forceCleanup = useCallback(() => {
    capturedPointerIdRef.current = null;
    document.body.classList.remove("catalog-dragging");
    setActiveData(null);
    setDragPointer(null);
    initialPointerRef.current = null;
    removeListenersRef.current();
    removeListenersRef.current = () => {};
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as CatalogDragData | undefined;
    if (!data) return;
    const ev = event.activatorEvent as PointerEvent | undefined;
    const initial = ev ? { x: ev.clientX, y: ev.clientY } : null;
    initialPointerRef.current = initial;
    if (initial) lastPointerRef.current = initial;
    /*
     * Do NOT call document.body.setPointerCapture here – it steals capture from
     * dnd-kit's managed element, triggering lostpointercapture → dragCancel.
     * Our capture-phase document listeners already track the pointer reliably.
     */
    capturedPointerIdRef.current = ev?.pointerId ?? null;
    setActiveData(data);
    setDragPointer(initial);
    document.body.classList.add("catalog-dragging");

    const onMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      setDragPointer({ x: e.clientX, y: e.clientY });
    };
    const onUpOrCancel = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    /*
     * Prevent browser from interpreting the touch as a scroll/pan gesture.
     * touch-action is evaluated at touchstart time, so the pan-y on catalog items
     * would otherwise let the browser fire pointercancel during vertical movement.
     */
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onUpOrCancel, true);
    document.addEventListener("pointercancel", onUpOrCancel, true);
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    removeListenersRef.current = () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onUpOrCancel, true);
      document.removeEventListener("pointercancel", onUpOrCancel, true);
      document.removeEventListener("touchmove", onTouchMove, true);
    };
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active } = event;
      const { x, y } = lastPointerRef.current;
      const data = active.data.current as CatalogDragData | undefined;
      forceCleanup();
      if (data) {
        placeFromCatalog(x, y, { mode: data.mode, templateId: data.templateId });
      }
    },
    [placeFromCatalog, forceCleanup]
  );

  const handleDragCancel = useCallback(() => {
    forceCleanup();
  }, [forceCleanup]);

  useEffect(() => {
    if (!activeData) return;
    const timeoutId = setTimeout(forceCleanup, SAFETY_NET_MS);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") forceCleanup();
    };
    const onPageHide = () => forceCleanup();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [activeData, forceCleanup]);

  const ghostPos = dragPointer ?? initialPointerRef.current ?? lastPointerRef.current;
  const showCustomGhost = activeData != null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      {/* Invisible overlay so dnd-kit still runs collision/drag logic */}
      <DragOverlay
        dropAnimation={null}
        zIndex={0}
        style={{ opacity: 0, pointerEvents: "none" }}
        modifiers={[captureInitialPointer]}
      >
        {activeData ? <CatalogDragOverlayContent data={activeData} zoom={zoom} /> : null}
      </DragOverlay>
      {/* Our ghost: fixed position from pointer, always centered */}
      {showCustomGhost && (
        <div
          className="catalog-drag-ghost-wrapper"
          style={{
            position: "fixed",
            left: ghostPos.x,
            top: ghostPos.y,
            transform: "translate(-50%, -50%)",
            zIndex: 70000,
            pointerEvents: "none",
          }}
        >
          <CatalogDragOverlayContent data={activeData} zoom={zoom} />
        </div>
      )}
    </DndContext>
  );
}

/** Unique draggable id for catalog items (avoids board vs device id collision). */
export function catalogDraggableId(catalogMode: "boards" | "devices", templateId: string): string {
  return `${catalogMode}-${templateId}`;
}

interface CatalogDraggableItemProps {
  id: string;
  catalogMode: "boards" | "devices";
  imageUrl: string | null;
  widthMm: number;
  depthMm: number;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function CatalogDraggableItem({
  id,
  catalogMode,
  imageUrl,
  widthMm,
  depthMm,
  children,
  className,
  title,
}: CatalogDraggableItemProps) {
  const draggableId = catalogDraggableId(catalogMode, id);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: draggableId,
    data: {
      templateId: id,
      mode: catalogMode,
      imageUrl,
      widthMm,
      depthMm,
    } satisfies CatalogDragData,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={className}
      title={title}
      onContextMenu={(e) => e.preventDefault()}
      {...attributes}
      {...listeners}
      role="option"
    >
      {children}
    </button>
  );
}

export { CANVAS_DROP_ID };
