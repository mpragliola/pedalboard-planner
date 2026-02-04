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
import { LONG_PRESS_MS, MOVE_THRESHOLD_PX } from "../../constants";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import "./CatalogDragGhost.css";

const CANVAS_DROP_ID = "canvas-drop";
const GHOST_MAX_PX = 80;
const SAFETY_NET_MS = 8000;

/** Centers the drag overlay on the pointer. The default transform keeps the press point under the cursor;
 * we need to add the initial offset (where user pressed on the source) then subtract half overlay size. */
const centerOverlayOnCursor: Modifier = ({ transform, overlayNodeRect, activeNodeRect, activatorEvent }) => {
  const w = overlayNodeRect?.width ?? 0;
  const h = overlayNodeRect?.height ?? 0;
  const ev = activatorEvent as PointerEvent | null;
  const rect = activeNodeRect;
  const offsetX = ev && rect ? ev.clientX - rect.left : 0;
  const offsetY = ev && rect ? ev.clientY - rect.top : 0;
  return {
    ...transform,
    x: transform.x + offsetX - w / 2,
    y: transform.y + offsetY - h / 2,
  };
};

function ghostDimensions(widthMm: number, depthMm: number): { w: number; h: number } {
  const max = Math.max(widthMm, depthMm);
  if (max <= 0) return { w: GHOST_MAX_PX, h: GHOST_MAX_PX };
  const scale = GHOST_MAX_PX / max;
  return {
    w: Math.round(widthMm * scale),
    h: Math.round(depthMm * scale),
  };
}

export interface CatalogDragData {
  templateId: string;
  mode: "boards" | "devices";
  imageUrl: string | null;
  widthMm: number;
  depthMm: number;
}

function CatalogDragOverlayContent({ data }: { data: CatalogDragData }) {
  const { w, h } = ghostDimensions(data.widthMm, data.depthMm);
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
  const { placeFromCatalog } = useApp();
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [activeData, setActiveData] = useState<CatalogDragData | null>(null);

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

  const forceCleanup = useCallback(() => {
    document.body.classList.remove("catalog-dragging");
    setActiveData(null);
    removeListenersRef.current();
    removeListenersRef.current = () => {};
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as CatalogDragData | undefined;
    if (!data) return;
    setActiveData(data);
    document.body.classList.add("catalog-dragging");

    const onMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onUpOrCancel = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onUpOrCancel, true);
    document.addEventListener("pointercancel", onUpOrCancel, true);
    removeListenersRef.current = () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onUpOrCancel, true);
      document.removeEventListener("pointercancel", onUpOrCancel, true);
    };
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const { x, y } = lastPointerRef.current;
      const data = active.data.current as CatalogDragData | undefined;
      forceCleanup();
      if (over?.id === CANVAS_DROP_ID && data) {
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null} zIndex={70000} modifiers={[centerOverlayOnCursor]}>
        {activeData ? <CatalogDragOverlayContent data={activeData} /> : null}
      </DragOverlay>
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
