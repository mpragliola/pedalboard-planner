import { forwardRef, useState, useEffect } from "react";
import { DEVICE_TYPE_ORDER, DEVICE_TYPE_LABEL } from "../../constants";
import type { DeviceType } from "../../data/devices";
import { useApp } from "../../context/AppContext";
import { CatalogModeSwitch } from "./CatalogModeSwitch";
import { TextFilter } from "./TextFilter";
import { CatalogList, CatalogListGrouped, type CatalogViewMode } from "./CatalogList";
import { CustomItemForm } from "./CustomItemForm";
import { SizeFilters } from "./SizeFilters";
import "./DropdownsPanel.css";

export type { CatalogMode } from "./CatalogModeSwitch";

const PHONE_MEDIA = "(max-width: 767px)";

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(PHONE_MEDIA).matches);
  useEffect(() => {
    const m = window.matchMedia(PHONE_MEDIA);
    const fn = () => setIsPhone(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return isPhone;
}

export const DropdownsPanel = forwardRef<HTMLDivElement>(function DropdownsPanel(_props, ref) {
  const {
    catalogMode,
    setCatalogMode,
    unit,
    filters,
    onBoardSelect,
    onDeviceSelect,
    onCustomBoardCreate,
    onCustomDeviceCreate,
  } = useApp();

  const {
    boardBrandFilter,
    setBoardBrandFilter,
    boardTextFilter,
    setBoardTextFilter,
    boardWidthMin,
    setBoardWidthMin,
    boardWidthMax,
    setBoardWidthMax,
    boardDepthMin,
    setBoardDepthMin,
    boardDepthMax,
    setBoardDepthMax,
    boardBrands,
    boardWidthRange,
    boardDepthRange,
    filteredBoards,
    resetBoardFilters,
    deviceTypeFilter,
    setDeviceTypeFilter,
    deviceBrandFilter,
    setDeviceBrandFilter,
    deviceTextFilter,
    setDeviceTextFilter,
    deviceWidthMin,
    setDeviceWidthMin,
    deviceWidthMax,
    setDeviceWidthMax,
    deviceDepthMin,
    setDeviceDepthMin,
    deviceDepthMax,
    setDeviceDepthMax,
    deviceBrands,
    deviceWidthRange,
    deviceDepthRange,
    filteredDevices,
    resetDeviceFilters,
  } = filters;

  const isPhone = useIsPhone();
  const listSize = isPhone ? 1 : 5;

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(false);
  const [catalogViewMode, setCatalogViewMode] = useState<CatalogViewMode>("text");

  const hasBoardFilters = !!(
    boardBrandFilter ||
    boardTextFilter ||
    boardWidthMin ||
    boardWidthMax ||
    boardDepthMin ||
    boardDepthMax
  );
  const hasDeviceFilters = !!(
    deviceBrandFilter ||
    deviceTypeFilter ||
    deviceTextFilter ||
    deviceWidthMin ||
    deviceWidthMax ||
    deviceDepthMin ||
    deviceDepthMax
  );

  const formatSliderValue = (mm: number) => (unit === "in" ? (mm / 25.4).toFixed(2) : String(Math.round(mm)));
  const unitLabel = unit === "in" ? "in" : "mm";

  /** Factory for min/max range filter handlers that auto-clamp the opposite bound. */
  const createRangeHandler =
    (
      type: "min" | "max",
      range: readonly [number, number],
      currentOpposite: string | undefined,
      setSelf: (v: string) => void,
      setOpposite: (v: string) => void
    ) =>
    (v: string) => {
      const boundary = type === "min" ? range[0] : range[1];
      const isAtBoundary = v === String(boundary);
      setSelf(isAtBoundary ? "" : v);
      const num = Number(v);
      const oppositeVal = currentOpposite ? Number(currentOpposite) : type === "min" ? range[1] : range[0];
      if (!isAtBoundary) {
        if (type === "min" && num > oppositeVal) setOpposite(v);
        if (type === "max" && num < oppositeVal) setOpposite(v);
      }
    };

  const handleBoardWidthMin = createRangeHandler(
    "min",
    boardWidthRange,
    boardWidthMax,
    setBoardWidthMin,
    setBoardWidthMax
  );
  const handleBoardWidthMax = createRangeHandler(
    "max",
    boardWidthRange,
    boardWidthMin,
    setBoardWidthMax,
    setBoardWidthMin
  );
  const handleBoardDepthMin = createRangeHandler(
    "min",
    boardDepthRange,
    boardDepthMax,
    setBoardDepthMin,
    setBoardDepthMax
  );
  const handleBoardDepthMax = createRangeHandler(
    "max",
    boardDepthRange,
    boardDepthMin,
    setBoardDepthMax,
    setBoardDepthMin
  );
  const handleDeviceWidthMin = createRangeHandler(
    "min",
    deviceWidthRange,
    deviceWidthMax,
    setDeviceWidthMin,
    setDeviceWidthMax
  );
  const handleDeviceWidthMax = createRangeHandler(
    "max",
    deviceWidthRange,
    deviceWidthMin,
    setDeviceWidthMax,
    setDeviceWidthMin
  );
  const handleDeviceDepthMin = createRangeHandler(
    "min",
    deviceDepthRange,
    deviceDepthMax,
    setDeviceDepthMin,
    setDeviceDepthMax
  );
  const handleDeviceDepthMax = createRangeHandler(
    "max",
    deviceDepthRange,
    deviceDepthMin,
    setDeviceDepthMax,
    setDeviceDepthMin
  );

  const deviceGroups: {
    deviceType: DeviceType;
    label: string;
    options: { id: string; name: string; type: string; image?: string | null; widthMm?: number; depthMm?: number }[];
  }[] = DEVICE_TYPE_ORDER.map((deviceType) => {
    const templates = filteredDevices.filter((t) => t.type === deviceType);
    if (templates.length === 0) return null;
    return {
      deviceType,
      label: DEVICE_TYPE_LABEL[deviceType],
      options: templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        image: t.image,
        widthMm: t.wdh[0],
        depthMm: t.wdh[1],
      })),
    };
  }).filter((g): g is NonNullable<typeof g> => g != null);

  return (
    <div ref={ref} className="floating-controls floating-dropdowns">
      <div className="catalog-switches-row">
        <CatalogModeSwitch value={catalogMode} onChange={setCatalogMode} />
      </div>

      <div className="dropdown-group catalog-content">
        {catalogMode === "boards" && (
          <>
            <label htmlFor="board-brand-filter" className="dropdown-label">
              Brand
            </label>
            <select
              id="board-brand-filter"
              className="dropdown dropdown-filter"
              value={boardBrandFilter}
              onChange={(e) => setBoardBrandFilter(e.target.value)}
            >
              <option value="">All brands</option>
              {boardBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="collapsible-toggle"
              onClick={() => setFiltersExpanded((e) => !e)}
              aria-expanded={filtersExpanded}
              aria-controls="board-filters-content"
            >
              <span className={`collapsible-chevron${filtersExpanded ? " expanded" : ""}`} aria-hidden>
                ▼
              </span>
              Filters
            </button>
            <div
              id="board-filters-content"
              className={`collapsible-content${filtersExpanded ? " expanded" : ""}`}
              aria-hidden={!filtersExpanded}
            >
              <div className="collapsible-inner">
                <TextFilter
                  id="board-text-filter"
                  label="Search"
                  placeholder="Name, brand, model…"
                  value={boardTextFilter}
                  onChange={setBoardTextFilter}
                />
                <SizeFilters
                  unitLabel={unitLabel}
                  widthRange={boardWidthRange}
                  widthMin={boardWidthMin ?? ""}
                  widthMax={boardWidthMax ?? ""}
                  onWidthMinChange={handleBoardWidthMin}
                  onWidthMaxChange={handleBoardWidthMax}
                  depthRange={boardDepthRange}
                  depthMin={boardDepthMin ?? ""}
                  depthMax={boardDepthMax ?? ""}
                  onDepthMinChange={handleBoardDepthMin}
                  onDepthMaxChange={handleBoardDepthMax}
                  formatSliderValue={formatSliderValue}
                />
                <button
                  type="button"
                  className="filter-reset"
                  onClick={resetBoardFilters}
                  disabled={!hasBoardFilters}
                  title={hasBoardFilters ? "Clear board filters" : "No filters active"}
                >
                  Reset filters
                </button>
              </div>
            </div>
            <CatalogList
              id="boards-select"
              label="Add board"
              size={listSize}
              options={filteredBoards.map((t) => ({
                id: t.id,
                name: t.name,
                image: t.image,
                widthMm: t.wdh[0],
                depthMm: t.wdh[1],
                color: t.color,
              }))}
              onAdd={onBoardSelect}
              catalogMode="boards"
              viewMode={catalogViewMode}
              onViewModeChange={setCatalogViewMode}
            />
            <div className="custom-section">
              <button
                type="button"
                className="collapsible-toggle custom-section-toggle"
                onClick={() => setCustomExpanded((e) => !e)}
                aria-expanded={customExpanded}
                aria-controls="custom-board-content"
              >
                <span className={`collapsible-chevron${customExpanded ? " expanded" : ""}`} aria-hidden>
                  ▼
                </span>
                Custom board
              </button>
              <div
                id="custom-board-content"
                className={`collapsible-content${customExpanded ? " expanded" : ""}`}
                aria-hidden={!customExpanded}
              >
                <CustomItemForm
                  idPrefix="custom-board"
                  itemType="board"
                  unitLabel={unitLabel}
                  unit={unit}
                  defaultWidth={400}
                  defaultDepth={200}
                  onCreate={onCustomBoardCreate}
                />
              </div>
            </div>
          </>
        )}

        {catalogMode === "devices" && (
          <>
            <div className="device-type-brand-row">
              <div className="device-filter-field">
                <label htmlFor="device-type-filter" className="dropdown-label">
                  Type
                </label>
                <select
                  id="device-type-filter"
                  className="dropdown dropdown-filter"
                  value={deviceTypeFilter}
                  onChange={(e) => setDeviceTypeFilter(e.target.value)}
                >
                  <option value="">All types</option>
                  {DEVICE_TYPE_ORDER.map((type) => (
                    <option key={type} value={type}>
                      {DEVICE_TYPE_LABEL[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="device-filter-field">
                <label htmlFor="device-brand-filter" className="dropdown-label">
                  Brand
                </label>
                <select
                  id="device-brand-filter"
                  className="dropdown dropdown-filter"
                  value={deviceBrandFilter}
                  onChange={(e) => setDeviceBrandFilter(e.target.value)}
                >
                  <option value="">All brands</option>
                  {deviceBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="collapsible-toggle"
              onClick={() => setFiltersExpanded((e) => !e)}
              aria-expanded={filtersExpanded}
              aria-controls="device-filters-content"
            >
              <span className={`collapsible-chevron${filtersExpanded ? " expanded" : ""}`} aria-hidden>
                ▼
              </span>
              Filters
            </button>
            <div
              id="device-filters-content"
              className={`collapsible-content${filtersExpanded ? " expanded" : ""}`}
              aria-hidden={!filtersExpanded}
            >
              <div className="collapsible-inner">
                <TextFilter
                  id="device-text-filter"
                  label="Search"
                  placeholder="Name, brand, model…"
                  value={deviceTextFilter}
                  onChange={setDeviceTextFilter}
                />
                <SizeFilters
                  unitLabel={unitLabel}
                  widthRange={deviceWidthRange}
                  widthMin={deviceWidthMin ?? ""}
                  widthMax={deviceWidthMax ?? ""}
                  onWidthMinChange={handleDeviceWidthMin}
                  onWidthMaxChange={handleDeviceWidthMax}
                  depthRange={deviceDepthRange}
                  depthMin={deviceDepthMin ?? ""}
                  depthMax={deviceDepthMax ?? ""}
                  onDepthMinChange={handleDeviceDepthMin}
                  onDepthMaxChange={handleDeviceDepthMax}
                  formatSliderValue={formatSliderValue}
                />
                <button
                  type="button"
                  className="filter-reset"
                  onClick={resetDeviceFilters}
                  disabled={!hasDeviceFilters}
                  title={hasDeviceFilters ? "Clear device filters" : "No filters active"}
                >
                  Reset filters
                </button>
              </div>
            </div>
            <CatalogListGrouped
              id="devices-select"
              label="Add device"
              size={listSize}
              groups={deviceGroups}
              onAdd={onDeviceSelect}
              catalogMode="devices"
              viewMode={catalogViewMode}
              onViewModeChange={setCatalogViewMode}
            />
            <div className="custom-section">
              <button
                type="button"
                className="collapsible-toggle custom-section-toggle"
                onClick={() => setCustomExpanded((e) => !e)}
                aria-expanded={customExpanded}
                aria-controls="custom-device-content"
              >
                <span className={`collapsible-chevron${customExpanded ? " expanded" : ""}`} aria-hidden>
                  ▼
                </span>
                Custom device
              </button>
              <div
                id="custom-device-content"
                className={`collapsible-content${customExpanded ? " expanded" : ""}`}
                aria-hidden={!customExpanded}
              >
                <CustomItemForm
                  idPrefix="custom-device"
                  itemType="device"
                  unitLabel={unitLabel}
                  unit={unit}
                  defaultWidth={75}
                  defaultDepth={120}
                  onCreate={onCustomDeviceCreate}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
