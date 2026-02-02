import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import { useApp } from "../../context/AppContext";
import type { BoardTemplate } from "../../data/boards";
import type { DeviceTemplate } from "../../data/devices";
import "./CatalogModal.css";

const GRID_MIN_COL_WIDTH = 100;
const GRID_GAP = 12;
const SCROLL_PADDING = 12;
const LONG_PRESS_MS = 400;

export type CatalogModalMode = "boards" | "devices";

interface CatalogModalProps {
  open: boolean;
  onClose: () => void;
}

function CatalogModal({ open, onClose }: CatalogModalProps) {
  const { catalogMode, filters, onBoardSelect, onDeviceSelect, startCatalogDrag, shouldIgnoreCatalogClick } = useApp();
  const list = catalogMode === "boards" ? filters.filteredBoards : filters.filteredDevices;
  const [visibleCount, setVisibleCount] = useState(0);
  const columnsRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerFiredRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const cleanupRef = useRef<() => void>(() => {});
  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";
  const MOVE_THRESHOLD_PX = 10;

  const visibleItems = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  const loadMore = useCallback(() => {
    const cols = columnsRef.current;
    setVisibleCount((c) => Math.min(c + cols, list.length));
  }, [list.length]);

  const recalcFromViewport = useCallback(() => {
    const scrollEl = scrollRef.current;
    const cardEl = scrollEl?.querySelector(".catalog-modal-card") as HTMLElement | null;
    if (!scrollEl || !cardEl || list.length === 0) return;

    const contentWidth = scrollEl.clientWidth - SCROLL_PADDING * 2;
    const contentHeight = scrollEl.clientHeight - SCROLL_PADDING * 2;
    const cols = Math.max(1, Math.floor((contentWidth + GRID_GAP) / (GRID_MIN_COL_WIDTH + GRID_GAP)));
    const cardHeight = cardEl.getBoundingClientRect().height;
    const rowHeight = cardHeight + GRID_GAP;
    const rows = Math.max(1, Math.floor((contentHeight + GRID_GAP) / rowHeight));
    const targetCount = cols * (rows + 1);

    columnsRef.current = cols;
    setVisibleCount((c) => Math.max(c, Math.min(targetCount, list.length)));
  }, [list.length]);

  useEffect(() => {
    if (!open) return;
    setVisibleCount(list.length > 0 ? 1 : 0);
  }, [open, catalogMode, list.length]);

  useEffect(() => {
    if (!open || visibleCount < 1 || list.length === 0) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const rafId = requestAnimationFrame(recalcFromViewport);
    const resizeObserver = new ResizeObserver(() => recalcFromViewport());
    resizeObserver.observe(scrollEl);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [open, visibleCount, list.length, catalogMode, recalcFromViewport]);

  useEffect(() => {
    if (!open || !hasMore) return;
    const scrollEl = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!scrollEl || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: scrollEl, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, loadMore, catalogMode]);

  const handleSelect = (id: string) => {
    if (shouldIgnoreCatalogClick()) return;
    if (catalogMode === "boards") onBoardSelect(id);
    else onDeviceSelect(id);
    onClose();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, item: BoardTemplate | DeviceTemplate) => {
    if (e.button !== 0) return;
    timerFiredRef.current = false;
    const start = { x: e.clientX, y: e.clientY };
    posRef.current = start;
    initialPosRef.current = start;
    const onMove = (ev: PointerEvent) => {
      posRef.current = { x: ev.clientX, y: ev.clientY };
      if (Math.hypot(ev.clientX - initialPosRef.current.x, ev.clientY - initialPosRef.current.y) > MOVE_THRESHOLD_PX) {
        cleanupRef.current();
      }
    };
    const onUp = () => {
      cleanupRef.current();
      /* Short tap: do not call handleSelect here; let the click event fire so handleSelect runs once. */
    };
    window.addEventListener("pointermove", onMove, { capture: true });
    window.addEventListener("pointerup", onUp, { capture: true });
    window.addEventListener("pointercancel", onUp, { capture: true });
    longPressTimerRef.current = setTimeout(() => {
      timerFiredRef.current = true;
      cleanupRef.current();
      const imageUrl = item.image ? `${imageBase}${item.image}` : null;
      const widthMm = item.wdh[0];
      const depthMm = item.wdh[1];
      startCatalogDrag(item.id, catalogMode, imageUrl, posRef.current.x, posRef.current.y, widthMm, depthMm);
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
  };

  if (!open) return null;

  const title = catalogMode === "boards" ? "Add board" : "Add device";

  const modal = (
    <div className="catalog-modal-backdrop" aria-hidden>
      <div className="catalog-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="catalog-modal-header">
          <h2 className="catalog-modal-title">{title}</h2>
          <button type="button" className="catalog-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div ref={scrollRef} className="catalog-modal-scroll">
          <div className="catalog-modal-grid">
            {visibleItems.map((item: BoardTemplate | DeviceTemplate) => (
              <button
                key={item.id}
                type="button"
                className="catalog-modal-card"
                onClick={() => handleSelect(item.id)}
                onPointerDown={(e) => handlePointerDown(e, item)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="catalog-modal-card-image-wrap">
                  {item.image ? (
                    <img src={`${imageBase}${item.image}`} alt="" className="catalog-modal-card-image" loading="lazy" />
                  ) : (
                    <span
                      className="catalog-modal-card-placeholder"
                      style={{
                        backgroundColor: (item as { color?: string }).color ?? DEFAULT_OBJECT_COLOR,
                      }}
                    />
                  )}
                </span>
                <span className="catalog-modal-card-name">{item.name}</span>
              </button>
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="catalog-modal-sentinel" aria-hidden />}
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

export { CatalogModal };
