import type { ReactNode, RefObject } from "react";
import { CatalogListHeader } from "./CatalogListHeader";
import type { CatalogViewMode } from "./types";

interface CatalogListFrameProps {
  id: string;
  label: string;
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  listRef: RefObject<HTMLDivElement>;
  ariaLabel: string;
  minHeight: number;
  children: ReactNode;
}

export function CatalogListFrame({
  id,
  label,
  viewMode,
  onViewModeChange,
  listRef,
  ariaLabel,
  minHeight,
  children,
}: CatalogListFrameProps) {
  const listClassName = `catalog-list catalog-list--${viewMode}`;

  return (
    <>
      <CatalogListHeader id={id} label={label} viewMode={viewMode} onViewModeChange={onViewModeChange} />
      <div ref={listRef} id={id} className={listClassName} role="listbox" aria-label={ariaLabel} style={{ minHeight }}>
        {children}
      </div>
      <p className="catalog-list-hint">Long-press to drag onto the board</p>
    </>
  );
}
