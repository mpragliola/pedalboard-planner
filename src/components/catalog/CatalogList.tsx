import { useRef, useState, useLayoutEffect, useCallback } from "react";
import {
  faLinkSlash,
  faChevronDown,
  faChevronRight,
  faGaugeHigh,
  faGuitar,
  faLayerGroup,
  faPlug,
  faSliders,
  faVolumeHigh,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import type { DeviceType } from "../../data/devices";
import { CatalogDraggableItem } from "./CatalogDndProvider";
import "./CatalogList.scss";

const DEVICE_TYPE_ICON: Record<DeviceType, IconDefinition> = {
  pedal: faGuitar,
  multifx: faLayerGroup,
  expression: faGaugeHigh,
  volume: faVolumeHigh,
  power: faPlug,
  controller: faSliders,
  wireless: faWifi,
  loopswitcher: faLinkSlash,
};

function buildPlaceholderStyle(
  widthMm: number | undefined,
  depthMm: number | undefined,
  color: string
) {
  const w = typeof widthMm === "number" && widthMm > 0 ? widthMm : 1;
  const d = typeof depthMm === "number" && depthMm > 0 ? depthMm : 1;
  const ratio = w / d;
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  if (safeRatio >= 1) {
    return {
      backgroundColor: color,
      width: "100%",
      height: `${(1 / safeRatio) * 100}%`,
    };
  }
  return {
    backgroundColor: color,
    width: `${safeRatio * 100}%`,
    height: "100%",
  };
}

export type CatalogViewMode = "text" | "list" | "grid" | "large" | "xlarge";

const VIEW_MODE_OPTIONS: ReadonlyArray<{
  mode: CatalogViewMode;
  title: string;
  symbol: string;
}> = [
  { mode: "text", title: "Text list", symbol: "\u2630" },
  { mode: "list", title: "Thumbnail list", symbol: "\u2637" },
  { mode: "grid", title: "Small grid", symbol: "\u25A6" },
  { mode: "large", title: "Large grid", symbol: "\u229E" },
  { mode: "xlarge", title: "Text list", symbol: "\u2656" },
];

export interface CatalogListOption {
  id: string;
  name: string;
  image?: string | null;
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
  /** 'boards' | 'devices' - used for drag-from-catalog drop on canvas */
  catalogMode: "boards" | "devices";
  /** Controlled view mode */
  viewMode: CatalogViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: CatalogViewMode) => void;
}

function ViewModeToggle({
  mode: currentMode,
  onChange,
}: {
  mode: CatalogViewMode;
  onChange: (m: CatalogViewMode) => void;
}) {
  return (
    <div className="catalog-view-toggle" role="group" aria-label="View mode">
      {VIEW_MODE_OPTIONS.map(({ mode, title, symbol }) => (
        <button
          key={mode}
          type="button"
          className={`catalog-view-btn${currentMode === mode ? " active" : ""}`}
          onClick={() => onChange(mode)}
          title={title}
          aria-pressed={currentMode === mode}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
}
export function CatalogList({ id, label, size, options, catalogMode, viewMode, onViewModeChange }: CatalogListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRestoreRef = useRef<number | null>(null);

  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";

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
            <CatalogDraggableItem
              key={opt.id}
              id={opt.id}
              catalogMode={catalogMode}
              imageUrl={opt.image ? `${imageBase}${opt.image}` : null}
              widthMm={opt.widthMm ?? 100}
              depthMm={opt.depthMm ?? 100}
              className="catalog-list-item"
              title={`Long-press to drag ${opt.name} onto the board`}
            >
              {viewMode !== "text" && (
                <span className="catalog-list-item-thumb">
                  {opt.image ? (
                    <img src={`${imageBase}${opt.image}`} alt="" aria-hidden loading="lazy" />
                  ) : (
                    <span
                      className="catalog-list-item-placeholder"
                      style={buildPlaceholderStyle(opt.widthMm, opt.depthMm, opt.color ?? DEFAULT_OBJECT_COLOR)}
                    />
                  )}
                </span>
              )}
              <span className="catalog-list-item-text">{opt.name}</span>
            </CatalogDraggableItem>
          ))
        )}
      </div>
      <p className="catalog-list-hint">Long-press to drag onto the board</p>
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
  groups: { deviceType?: DeviceType; label: string; options: CatalogListGroupOption[] }[];
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
  catalogMode,
  viewMode,
  onViewModeChange,
}: CatalogListGroupedProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRestoreRef = useRef<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = useCallback((groupLabel: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupLabel)) next.delete(groupLabel);
      else next.add(groupLabel);
      return next;
    });
  }, []);

  const imageBase = catalogMode === "boards" ? "images/boards/" : "images/devices/";

  useLayoutEffect(() => {
    const el = listRef.current;
    const saved = scrollRestoreRef.current;
    if (el && saved !== null) {
      el.scrollTop = saved;
      scrollRestoreRef.current = null;
    }
  });

  const listClassName = `catalog-list catalog-list--${viewMode}`;
  const minHeight = [ "grid", "large", "xlarge" ].includes(viewMode) ? 120 : size * 28;

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
                      <CatalogDraggableItem
                        key={opt.id}
                        id={opt.id}
                        catalogMode={catalogMode}
                        imageUrl={opt.image ? `${imageBase}${opt.image}` : null}
                        widthMm={opt.widthMm ?? 75}
                        depthMm={opt.depthMm ?? 120}
                        className="catalog-list-item"
                        title={`Long-press to drag ${opt.name} onto the board`}
                      >
                        {viewMode !== "text" && (
                          <span className="catalog-list-item-thumb">
                            {opt.image ? (
                              <img src={`${imageBase}${opt.image}`} alt="" aria-hidden loading="lazy" />
                            ) : (
                              <span
                                className="catalog-list-item-placeholder"
                                style={buildPlaceholderStyle(opt.widthMm, opt.depthMm, opt.color ?? DEFAULT_OBJECT_COLOR)}
                              />
                            )}
                          </span>
                        )}
                        <span className="catalog-list-item-text">{opt.name}</span>
                      </CatalogDraggableItem>
                    ))}
                  </div>
                </div>
              </div>
            ) : null
          )
        )}
      </div>
      <p className="catalog-list-hint">Long-press to drag onto the board</p>
    </>
  );
}
