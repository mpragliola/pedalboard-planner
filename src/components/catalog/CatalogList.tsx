import { useRef, useState, useLayoutEffect, useCallback } from "react";
import {
  faChevronDown,
  faChevronRight,
  faGuitar,
  faLayerGroup,
  faPlug,
  faSliders,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import type { DeviceType } from "../../data/devices";
import { useCatalogItemDrag, type CatalogItemDragOption } from "../../hooks/useCatalogItemDrag";
import "./CatalogList.css";

const DEVICE_TYPE_ICON: Record<DeviceType, IconDefinition> = {
  pedal: faGuitar,
  multifx: faLayerGroup,
  power: faPlug,
  controller: faSliders,
  wireless: faWifi,
};

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
  onAdd: _onAdd,
  catalogMode,
  viewMode,
  onViewModeChange,
}: CatalogListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const { handlePointerDown, imageBase } = useCatalogItemDrag({
    catalogMode,
    defaultWidthMm: 100,
    defaultDepthMm: 100,
  });

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if ((e.target as Element).closest(".catalog-list-item")) e.preventDefault();
    };
    el.addEventListener("touchstart", handler, { passive: false });
    return () => el.removeEventListener("touchstart", handler);
  }, []);

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
              title={`Drag ${opt.name} to place on board`}
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
      <p className="catalog-list-hint">Drag to place on board</p>
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
  groups: { deviceType?: DeviceType; label: string; options: CatalogListGroupOption[] }[];
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
  onAdd: _onAddGrouped,
  catalogMode,
  viewMode,
  onViewModeChange,
}: CatalogListGroupedProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = useCallback((groupLabel: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupLabel)) next.delete(groupLabel);
      else next.add(groupLabel);
      return next;
    });
  }, []);

  const { handlePointerDown, imageBase } = useCatalogItemDrag({
    catalogMode,
    defaultWidthMm: 75,
    defaultDepthMm: 120,
  });

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if ((e.target as Element).closest(".catalog-list-item")) e.preventDefault();
    };
    el.addEventListener("touchstart", handler, { passive: false });
    return () => el.removeEventListener("touchstart", handler);
  }, []);

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
          groups.map(({ deviceType, label: groupLabel, options: groupOptions }) =>
            groupOptions.length > 0 ? (
              <div key={groupLabel} className="catalog-list-group">
                {viewMode !== "grid" && viewMode !== "large" && (
                  <button
                    type="button"
                    className="catalog-list-group-label"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleGroup(groupLabel);
                    }}
                    aria-expanded={!collapsedGroups.has(groupLabel)}
                    aria-controls={`${id}-group-${groupLabel.replace(/\s+/g, "-")}`}
                  >
                    <span className="catalog-list-group-label-text">{groupLabel}</span>
                    <span className="catalog-list-group-label-icons">
                      {deviceType && DEVICE_TYPE_ICON[deviceType] && (
                        <FontAwesomeIcon
                          icon={DEVICE_TYPE_ICON[deviceType]}
                          className="catalog-list-group-icon"
                          aria-hidden
                        />
                      )}
                      <FontAwesomeIcon
                        icon={collapsedGroups.has(groupLabel) ? faChevronRight : faChevronDown}
                        className="catalog-list-group-chevron"
                        aria-hidden
                      />
                    </span>
                  </button>
                )}
                <div
                  id={
                    viewMode !== "grid" && viewMode !== "large"
                      ? `${id}-group-${groupLabel.replace(/\s+/g, "-")}`
                      : undefined
                  }
                  className={`catalog-list-group-inner ${
                    viewMode !== "grid" && viewMode !== "large" && collapsedGroups.has(groupLabel)
                      ? "collapsed"
                      : "expanded"
                  }`}
                  style={viewMode === "grid" || viewMode === "large" ? { display: "block" } : { display: "grid" }}
                >
                  <div
                    className={
                      viewMode === "grid" || viewMode === "large"
                        ? "catalog-list-group-grid"
                        : "catalog-list-group-content"
                    }
                  >
                    {groupOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        className="catalog-list-item"
                        onPointerDown={(e) => handlePointerDown(e, opt)}
                        onContextMenu={(e) => e.preventDefault()}
                        title={`Drag ${opt.name} to place on board`}
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
              </div>
            ) : null
          )
        )}
      </div>
      <p className="catalog-list-hint">Drag to place on board</p>
    </>
  );
}
