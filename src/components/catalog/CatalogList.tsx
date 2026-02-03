import { useRef, useLayoutEffect, useCallback } from "react";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import { useCatalogItemDrag, type CatalogItemDragOption } from "../../hooks/useCatalogItemDrag";
import "./CatalogList.css";

export type CatalogViewMode = "text" | "list" | "grid" | "large";

export interface CatalogListOption extends CatalogItemDragOption {
  name: string;
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

  const handleAdd = useCallback(
    (optId: string) => {
      if (listRef.current) scrollRestoreRef.current = listRef.current.scrollTop;
      onAdd(optId);
    },
    [onAdd]
  );

  const { handlePointerDown, imageBase } = useCatalogItemDrag({
    catalogMode,
    defaultWidthMm: 100,
    defaultDepthMm: 100,
    onTap: handleAdd,
  });

  useLayoutEffect(() => {
    const el = listRef.current;
    const saved = scrollRestoreRef.current;
    if (el && saved !== null) {
      el.scrollTop = saved;
      scrollRestoreRef.current = null;
    }
  });

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
      <p className="catalog-list-hint">Click to add, long-press to drag</p>
    </>
  );
}

export interface CatalogListGroupOption extends CatalogItemDragOption {
  name: string;
  type: string;
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

  const handleAdd = useCallback(
    (optId: string) => {
      if (listRef.current) scrollRestoreRef.current = listRef.current.scrollTop;
      onAdd(optId);
    },
    [onAdd]
  );

  const { handlePointerDown, imageBase } = useCatalogItemDrag({
    catalogMode,
    defaultWidthMm: 75,
    defaultDepthMm: 120,
    onTap: handleAdd,
  });

  useLayoutEffect(() => {
    const el = listRef.current;
    const saved = scrollRestoreRef.current;
    if (el && saved !== null) {
      el.scrollTop = saved;
      scrollRestoreRef.current = null;
    }
  });

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
      <p className="catalog-list-hint">Click to add, long-press to drag</p>
    </>
  );
}
