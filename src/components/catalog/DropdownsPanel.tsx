import { forwardRef, useState } from "react";
import { DEVICE_TYPE_ORDER, DEVICE_TYPE_LABEL } from "../../constants";
import type { DeviceType } from "../../data/devices";
import type { RangeFilter } from "../../hooks/useFilterState";
import { useCatalog } from "../../context/CatalogContext";
import { useUi } from "../../context/UiContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { CatalogModeSwitch } from "./CatalogModeSwitch";
import { TextFilter } from "./TextFilter";
import { CatalogList, CatalogListGrouped, type CatalogViewMode } from "./CatalogList";
import { CustomItemForm } from "./CustomItemForm";
import { SizeFilters } from "./SizeFilters";
import "./DropdownsPanel.scss";

export type { CatalogMode } from "./CatalogModeSwitch";

/** Factory for min/max range filter handlers that auto-clamp the opposite bound. */
function createRangeHandler(
  type: "min" | "max",
  range: readonly [number, number],
  filter: RangeFilter
) {
  const [setSelf, getOpp, setOpp] =
    type === "min"
      ? [filter.setMin, () => filter.max, filter.setMax] as const
      : [filter.setMax, () => filter.min, filter.setMin] as const;

  return (v: string) => {
    const boundary = type === "min" ? range[0] : range[1];
    const isAtBoundary = v === String(boundary);
    setSelf(isAtBoundary ? "" : v);
    const num = Number(v);
    const oppositeVal = getOpp() ? Number(getOpp()) : type === "min" ? range[1] : range[0];
    if (!isAtBoundary) {
      if (type === "min" && num > oppositeVal) setOpp(v);
      if (type === "max" && num < oppositeVal) setOpp(v);
    }
  };
}

export const DropdownsPanel = forwardRef<HTMLDivElement>(function DropdownsPanel(_props, ref) {
  const { catalogMode, setCatalogMode, filters, onCustomCreate } = useCatalog();
  const { unit } = useUi();

  const {
    boardBrand, boardText, boardWidth, boardDepth,
    boardBrands, boardWidthRange, boardDepthRange, filteredBoards,
    hasBoardFilters, resetBoardFilters,
    deviceType, deviceBrand, deviceText, deviceWidth, deviceDepth,
    deviceBrands, deviceWidthRange, deviceDepthRange, filteredDevices,
    hasDeviceFilters, resetDeviceFilters,
  } = filters;

  const isPhone = useMediaQuery("(max-width: 767px)");
  const listSize = isPhone ? 1 : 5;

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(false);
  const [catalogViewMode, setCatalogViewMode] = useState<CatalogViewMode>("text");

  const formatSliderValue = (mm: number) => (unit === "in" ? (mm / 25.4).toFixed(2) : String(Math.round(mm)));
  const unitLabel = unit === "in" ? "in" : "mm";

  const handleBoardWidthMin = createRangeHandler("min", boardWidthRange, boardWidth);
  const handleBoardWidthMax = createRangeHandler("max", boardWidthRange, boardWidth);
  const handleBoardDepthMin = createRangeHandler("min", boardDepthRange, boardDepth);
  const handleBoardDepthMax = createRangeHandler("max", boardDepthRange, boardDepth);
  const handleDeviceWidthMin = createRangeHandler("min", deviceWidthRange, deviceWidth);
  const handleDeviceWidthMax = createRangeHandler("max", deviceWidthRange, deviceWidth);
  const handleDeviceDepthMin = createRangeHandler("min", deviceDepthRange, deviceDepth);
  const handleDeviceDepthMax = createRangeHandler("max", deviceDepthRange, deviceDepth);

  const deviceGroups: {
    deviceType: DeviceType;
    label: string;
    options: { id: string; name: string; type: string; image?: string | null; widthMm?: number; depthMm?: number }[];
  }[] = DEVICE_TYPE_ORDER.map((dt) => {
    const templates = filteredDevices.filter((t) => t.type === dt);
    if (templates.length === 0) return null;
    return {
      deviceType: dt,
      label: DEVICE_TYPE_LABEL[dt],
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
              value={boardBrand.value}
              onChange={(e) => boardBrand.set(e.target.value)}
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
                  value={boardText.value}
                  onChange={boardText.set}
                />
                <SizeFilters
                  unitLabel={unitLabel}
                  widthRange={boardWidthRange}
                  widthMin={boardWidth.min}
                  widthMax={boardWidth.max}
                  onWidthMinChange={handleBoardWidthMin}
                  onWidthMaxChange={handleBoardWidthMax}
                  depthRange={boardDepthRange}
                  depthMin={boardDepth.min}
                  depthMax={boardDepth.max}
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
                  onCreate={(params) => onCustomCreate("boards", params)}
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
                  value={deviceType.value}
                  onChange={(e) => deviceType.set(e.target.value)}
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
                  value={deviceBrand.value}
                  onChange={(e) => deviceBrand.set(e.target.value)}
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
                  value={deviceText.value}
                  onChange={deviceText.set}
                />
                <SizeFilters
                  unitLabel={unitLabel}
                  widthRange={deviceWidthRange}
                  widthMin={deviceWidth.min}
                  widthMax={deviceWidth.max}
                  onWidthMinChange={handleDeviceWidthMin}
                  onWidthMaxChange={handleDeviceWidthMax}
                  depthRange={deviceDepthRange}
                  depthMin={deviceDepth.min}
                  depthMax={deviceDepth.max}
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
                  onCreate={(params) => onCustomCreate("devices", params)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
