import { useRef, useLayoutEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import "./CatalogList.css";

const LONG_PRESS_MS = 400;

export interface CatalogListOption {
  id: string;
  name: string;
  /** Optional image path (e.g. from template.image) for drag ghost */
  image?: string | null;
  /** Dimensions in mm for ghost aspect ratio */
  widthMm?: number;
  depthMm?: number;
}

interface CatalogListProps {
  id: string;
  label: string;
  size: number;
  options: CatalogListOption[];
  onAdd: (id: string) => void;
  /** 'boards' | 'devices' – used for drag-from-catalog drop on canvas */
  catalogMode: "boards" | "devices";
}

export function CatalogList({ id, label, size, options, onAdd, catalogMode }: CatalogListProps) {
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
      const onMove = (ev: PointerEvent) => {
        posRef.current = { x: ev.clientX, y: ev.clientY };
        if (
          Math.hypot(ev.clientX - initialPosRef.current.x, ev.clientY - initialPosRef.current.y) > MOVE_THRESHOLD_PX
        ) {
          cleanupRef.current();
        }
      };
      const onUp = () => {
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
        startCatalogDrag(opt.id, catalogMode, imageUrl, posRef.current.x, posRef.current.y, widthMm, depthMm);
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

  return (
    <>
      {label ? (
        <label id={`${id}-label`} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <div
        ref={listRef}
        id={id}
        className="catalog-list"
        role="listbox"
        aria-label={label || "Add board"}
        style={{ minHeight: size * 28 }}
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
              {opt.image ? (
                <img
                  src={`${imageBase}${opt.image}`}
                  alt=""
                  aria-hidden
                  className="catalog-list-item-drag-image"
                  width={48}
                  height={48}
                />
              ) : null}
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
}

interface CatalogListGroupedProps {
  id: string;
  label: string;
  size: number;
  groups: { label: string; options: CatalogListGroupOption[] }[];
  onAdd: (id: string) => void;
  catalogMode: "boards" | "devices";
}

export function CatalogListGrouped({ id, label, size, groups, onAdd, catalogMode }: CatalogListGroupedProps) {
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
      const onMove = (ev: PointerEvent) => {
        posRef.current = { x: ev.clientX, y: ev.clientY };
        if (
          Math.hypot(ev.clientX - initialPosRef.current.x, ev.clientY - initialPosRef.current.y) > MOVE_THRESHOLD_PX
        ) {
          cleanupRef.current();
        }
      };
      const onUp = () => {
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
        startCatalogDrag(opt.id, catalogMode, imageUrl, posRef.current.x, posRef.current.y, widthMm, depthMm);
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

  return (
    <>
      {label ? (
        <label id={`${id}-label`} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <div
        ref={listRef}
        id={id}
        className="catalog-list"
        role="listbox"
        aria-label={label || "Add device"}
        style={{ minHeight: size * 28 }}
      >
        {groups.every((g) => g.options.length === 0) ? (
          <div className="catalog-list-empty">No matches</div>
        ) : (
          groups.map(({ label: groupLabel, options: groupOptions }) =>
            groupOptions.length > 0 ? (
              <div key={groupLabel} className="catalog-list-group">
                <div className="catalog-list-group-label">{groupLabel}</div>
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
                    {opt.image ? (
                      <img
                        src={`${imageBase}${opt.image}`}
                        alt=""
                        aria-hidden
                        className="catalog-list-item-drag-image"
                        width={48}
                        height={48}
                      />
                    ) : null}
                    <span className="catalog-list-item-text">{opt.name}</span>
                  </button>
                ))}
              </div>
            ) : null
          )
        )}
      </div>
    </>
  );
}
