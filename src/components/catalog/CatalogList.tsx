import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { CatalogListFrame } from "./catalog-list/CatalogListFrame";
import { CatalogListGroupSection } from "./catalog-list/CatalogListGroupSection";
import { CatalogListItem } from "./catalog-list/CatalogListItem";
import { imageBaseForCatalogMode, thumbSizesForCatalogViewMode } from "./catalog-list/catalogListView";
import type {
  CatalogListGroup,
  CatalogListOption,
  CatalogMode,
  CatalogViewMode,
} from "./catalog-list/types";
import "./CatalogList.scss";

export type { CatalogListGroupOption, CatalogListOption, CatalogViewMode } from "./catalog-list/types";

interface CatalogListProps {
  id: string;
  label: string;
  size: number;
  options: CatalogListOption[];
  /** 'boards' | 'devices' - used for drag-from-catalog drop on canvas */
  catalogMode: CatalogMode;
  /** Controlled view mode */
  viewMode: CatalogViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: CatalogViewMode) => void;
}

function useCatalogListRefWithScrollRestore() {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRestoreRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    const saved = scrollRestoreRef.current;
    if (el && saved !== null) {
      el.scrollTop = saved;
      scrollRestoreRef.current = null;
    }
  });

  return listRef;
}

export function CatalogList({ id, label, size, options, catalogMode, viewMode, onViewModeChange }: CatalogListProps) {
  const listRef = useCatalogListRefWithScrollRestore();

  const imageBase = imageBaseForCatalogMode(catalogMode);
  const thumbnailSizes = thumbSizesForCatalogViewMode(viewMode);
  const minHeight = viewMode === "grid" || viewMode === "large" ? 120 : size * 28;

  return (
    <CatalogListFrame
      id={id}
      label={label}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      listRef={listRef}
      ariaLabel={label || "Add board"}
      minHeight={minHeight}
    >
      {options.length === 0 ? (
        <div className="catalog-list-empty">No matches</div>
      ) : (
        options.map((option) => (
          <CatalogListItem
            key={option.id}
            option={option}
            catalogMode={catalogMode}
            viewMode={viewMode}
            imageBase={imageBase}
            thumbnailSizes={thumbnailSizes}
            defaultWidthMm={100}
            defaultDepthMm={100}
          />
        ))
      )}
    </CatalogListFrame>
  );
}

interface CatalogListGroupedProps {
  id: string;
  label: string;
  size: number;
  groups: CatalogListGroup[];
  catalogMode: CatalogMode;
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
  const listRef = useCatalogListRefWithScrollRestore();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = useCallback((groupLabel: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupLabel)) next.delete(groupLabel);
      else next.add(groupLabel);
      return next;
    });
  }, []);

  const imageBase = imageBaseForCatalogMode(catalogMode);
  const thumbnailSizes = thumbSizesForCatalogViewMode(viewMode);
  const minHeight = ["grid", "large", "xlarge"].includes(viewMode) ? 120 : size * 28;

  return (
    <CatalogListFrame
      id={id}
      label={label}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      listRef={listRef}
      ariaLabel={label || "Add device"}
      minHeight={minHeight}
    >
      {groups.every((group) => group.options.length === 0) ? (
        <div className="catalog-list-empty">No matches</div>
      ) : (
        groups.map((group) => (
          <CatalogListGroupSection
            key={group.label}
            listId={id}
            group={group}
            catalogMode={catalogMode}
            viewMode={viewMode}
            imageBase={imageBase}
            thumbnailSizes={thumbnailSizes}
            isCollapsed={collapsedGroups.has(group.label)}
            onToggle={toggleGroup}
          />
        ))
      )}
    </CatalogListFrame>
  );
}
