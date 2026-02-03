import { useRef, useLayoutEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import "./CatalogList.css";

const LONG_PRESS_MS = 400;

export type CatalogViewMode = "text" | "list" | "grid" | "large";

export interface CatalogListOption {
  id: string;
  name: string;
  /** Optional image path (e.g. from template.image) for drag ghost */
  image?: string | null;
  /** Dimensions in mm for ghost aspect ratio */
  widthMm?: number;
  depthMm?: number;
  /** Color for placeholder when no image */
  color?: string;
}

interface CatalogListProps {
  id: string;
  label: string;
  size: number;
  options: CatalogListOption[];
  onAdd: (id: string) => void;
  /** 'boards' | 'devices' – used for drag-from-catalog drop on canvas */
  catalogMode: "boards" | "devices";
  /** Controlled view mode */
  viewMode: CatalogViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: CatalogViewMode) => void;
}

function ViewModeToggle({ mode, onChange }: { mode: CatalogViewMode; onChange: (m: CatalogViewMode) => void }) {
  return (
    <div className="catalog-view-toggle" role="group" aria-label="View mode">
      <button
        type="button"
        className={`catalog-view-btn${mode === "text" ? " active" : ""}`}
        onClick={() => onChange("text")}
        title="Text list"
        aria-pressed={mode === "text"}
      >
        ☰
      </button>
      <button
        type="button"
        className={`catalog-view-btn${mode === "list" ? " active" : ""}`}
        onClick={() => onChange("list")}
        title="Thumbnail list"
        aria-pressed={mode === "list"}
      >
        ☷
      </button>
      <button
        type="button"
        className={`catalog-view-btn${mode === "grid" ? " active" : ""}`}
        onClick={() => onChange("grid")}
        title="Small grid"
        aria-pressed={mode === "grid"}
      >
        ▦
      </button>
      <button
        type="button"
        className={`catalog-view-btn${mode === "large" ? " active" : ""}`}
        onClick={() => onChange("large")}
        title="Large grid"
        aria-pressed={mode === "large"}
      >
        ⊞
      </button>
    </div>
  );
}

export function CatalogList({
  id,
  label,
  size,
  options,
  onAdd,
  catalogMode,
  viewMode,
  onViewModeChange,
}: CatalogListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRestoreRef = useRef<number | null>(null);
  const { startCatalogDrag } = useApp();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerFiredRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const cleanupRef = useRef<() => void>(() => {});
  const MOVE_THRESHOLD_PX = 10;

  useLayoutEffect(() => {
    const el = listRef.current;
    const saved = scrollRestoreRef.current;
    if (el && saved !== null) {
      el.scrollTop = saved;
      scrollRestoreRef.current = null;
    }
  });

  const handleAdd = (optId: string) => {
    if (listRef.current) scrollRestoreRef.current = listRef.current.scrollTop;
    onAdd(optId);
  };

  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, opt: CatalogListOption) => {
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
        if (!timerFiredRef.current) handleAdd(opt.id);
      };
      window.addEventListener("pointermove", onMove, { capture: true });
      window.addEventListener("pointerup", onUp, { capture: true });
      window.addEventListener("pointercancel", onUp, { capture: true });
      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        cleanupRef.current();
        const imageUrl = opt.image ? `${imageBase}${opt.image}` : null;
        const widthMm = opt.widthMm ?? 100;
        const depthMm = opt.depthMm ?? 100;
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
    [catalogMode, imageBase, startCatalogDrag]
  );

  const listClassName = `catalog-list catalog-list--${viewMode}`;
  const minHeight = viewMode === "grid" || viewMode === "large" ? 120 : size * 28;

  return (
    <>
      <div className="catalog-list-header">
        {label ? (
          <label id={`${id}-label`} className="dropdown-label">
            {label}
          </label>
        ) : null}
        <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
      </div>
      <div
        ref={listRef}
        id={id}
        className={listClassName}
        role="listbox"
        aria-label={label || "Add board"}
        style={{ minHeight }}
      >
        {options.length === 0 ? (
          <div className="catalog-list-empty">No matches</div>
        ) : (
          options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="option"
              className="catalog-list-item"
              onPointerDown={(e) => handlePointerDown(e, opt)}
              onContextMenu={(e) => e.preventDefault()}
              title={`Add ${opt.name} (long-press to drag)`}
            >
              {viewMode !== "text" && (
                <span className="catalog-list-item-thumb">
                  {opt.image ? (
                    <img src={`${imageBase}${opt.image}`} alt="" aria-hidden loading="lazy" />
                  ) : (
                    <span
                      className="catalog-list-item-placeholder"
                      style={{ backgroundColor: opt.color ?? DEFAULT_OBJECT_COLOR }}
                    />
                  )}
                </span>
              )}
              <span className="catalog-list-item-text">{opt.name}</span>
            </button>
          ))
        )}
      </div>
    </>
  );
}

export interface CatalogListGroupOption {
  id: string;
  name: string;
  type: string;
  image?: string | null;
  widthMm?: number;
  depthMm?: number;
  color?: string;
}

interface CatalogListGroupedProps {
  id: string;
  label: string;
  size: number;
  groups: { label: string; options: CatalogListGroupOption[] }[];
  onAdd: (id: string) => void;
  catalogMode: "boards" | "devices";
  /** Controlled view mode */
  viewMode: CatalogViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: CatalogViewMode) => void;
}

export function CatalogListGrouped({
  id,
  label,
  size,
  groups,
  onAdd,
  catalogMode,
  viewMode,
  onViewModeChange,
}: CatalogListGroupedProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRestoreRef = useRef<number | null>(null);
  const { startCatalogDrag } = useApp();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerFiredRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const cleanupRef = useRef<() => void>(() => {});
  const MOVE_THRESHOLD_PX = 10;

  useLayoutEffect(() => {
    const el = listRef.current;
    const saved = scrollRestoreRef.current;
    if (el && saved !== null) {
      el.scrollTop = saved;
      scrollRestoreRef.current = null;
    }
  });

  const handleAdd = (optId: string) => {
    if (listRef.current) scrollRestoreRef.current = listRef.current.scrollTop;
    onAdd(optId);
  };

  const imageBase = catalogMode === "devices" ? "images/devices/" : "images/boards/";

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, opt: CatalogListGroupOption) => {
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
        if (!timerFiredRef.current) handleAdd(opt.id);
      };
      window.addEventListener("pointermove", onMove, { capture: true });
      window.addEventListener("pointerup", onUp, { capture: true });
      window.addEventListener("pointercancel", onUp, { capture: true });
      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        cleanupRef.current();
        const imageUrl = opt.image ? `${imageBase}${opt.image}` : null;
        const widthMm = opt.widthMm ?? 75;
        const depthMm = opt.depthMm ?? 120;
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
    [catalogMode, imageBase, startCatalogDrag]
  );

  const listClassName = `catalog-list catalog-list--${viewMode}`;
  const minHeight = viewMode === "grid" || viewMode === "large" ? 120 : size * 28;

  return (
    <>
      <div className="catalog-list-header">
        {label ? (
          <label id={`${id}-label`} className="dropdown-label">
            {label}
          </label>
        ) : null}
        <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
      </div>
      <div
        ref={listRef}
        id={id}
        className={listClassName}
        role="listbox"
        aria-label={label || "Add device"}
        style={{ minHeight }}
      >
        {groups.every((g) => g.options.length === 0) ? (
          <div className="catalog-list-empty">No matches</div>
        ) : (
          groups.map(({ label: groupLabel, options: groupOptions }) =>
            groupOptions.length > 0 ? (
              <div key={groupLabel} className="catalog-list-group">
                {viewMode !== "grid" && viewMode !== "large" && (
                  <div className="catalog-list-group-label">{groupLabel}</div>
                )}
                <div className={viewMode === "grid" || viewMode === "large" ? "catalog-list-group-grid" : undefined}>
                  {groupOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      className="catalog-list-item"
                      onPointerDown={(e) => handlePointerDown(e, opt)}
                      onContextMenu={(e) => e.preventDefault()}
                      title={`Add ${opt.name} (long-press to drag)`}
                    >
                      {viewMode !== "text" && (
                        <span className="catalog-list-item-thumb">
                          {opt.image ? (
                            <img src={`${imageBase}${opt.image}`} alt="" aria-hidden loading="lazy" />
                          ) : (
                            <span
                              className="catalog-list-item-placeholder"
                              style={{ backgroundColor: opt.color ?? DEFAULT_OBJECT_COLOR }}
                            />
                          )}
                        </span>
                      )}
                      <span className="catalog-list-item-text">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </div>
    </>
  );
}
