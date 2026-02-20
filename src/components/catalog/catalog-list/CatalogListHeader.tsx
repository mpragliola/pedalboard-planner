import type { CatalogViewMode } from "./types";

const CATALOG_VIEW_MODE_OPTIONS: ReadonlyArray<{
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

function CatalogViewModeToggle({
  mode: currentMode,
  onChange,
}: {
  mode: CatalogViewMode;
  onChange: (mode: CatalogViewMode) => void;
}) {
  return (
    <div className="catalog-view-toggle" role="group" aria-label="View mode">
      {CATALOG_VIEW_MODE_OPTIONS.map(({ mode, title, symbol }) => (
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

interface CatalogListHeaderProps {
  id: string;
  label: string;
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
}

export function CatalogListHeader({ id, label, viewMode, onViewModeChange }: CatalogListHeaderProps) {
  return (
    <div className="catalog-list-header">
      {label ? (
        <label id={`${id}-label`} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <CatalogViewModeToggle mode={viewMode} onChange={onViewModeChange} />
    </div>
  );
}
