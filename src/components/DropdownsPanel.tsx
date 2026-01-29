import { forwardRef } from 'react'
import { DEVICE_TYPE_ORDER, DEVICE_TYPE_LABEL } from '../constants'
import type { BoardTemplate } from '../data/boards'
import type { DeviceTemplate } from '../data/devices'

export type CatalogMode = 'boards' | 'devices'

interface DropdownsPanelProps {
  catalogMode: CatalogMode
  onCatalogModeChange: (mode: CatalogMode) => void
  unit: 'mm' | 'in'
  onUnitChange: (unit: 'mm' | 'in') => void
  // Board
  boardBrandFilter: string
  setBoardBrandFilter: (v: string) => void
  boardTextFilter: string
  setBoardTextFilter: (v: string) => void
  boardWidthMin: string
  setBoardWidthMin: (v: string) => void
  boardWidthMax: string
  setBoardWidthMax: (v: string) => void
  boardDepthMin: string
  setBoardDepthMin: (v: string) => void
  boardDepthMax: string
  setBoardDepthMax: (v: string) => void
  boardBrands: string[]
  boardWidthRange: readonly [number, number]
  boardDepthRange: readonly [number, number]
  filteredBoards: BoardTemplate[]
  selectedBoard: string
  onBoardSelect: (templateId: string) => void
  onResetBoardFilters: () => void
  hasBoardFilters: boolean
  // Device
  deviceTypeFilter: string
  setDeviceTypeFilter: (v: string) => void
  deviceBrandFilter: string
  setDeviceBrandFilter: (v: string) => void
  deviceTextFilter: string
  setDeviceTextFilter: (v: string) => void
  deviceWidthMin: string
  setDeviceWidthMin: (v: string) => void
  deviceWidthMax: string
  setDeviceWidthMax: (v: string) => void
  deviceDepthMin: string
  setDeviceDepthMin: (v: string) => void
  deviceDepthMax: string
  setDeviceDepthMax: (v: string) => void
  deviceBrands: string[]
  deviceWidthRange: readonly [number, number]
  deviceDepthRange: readonly [number, number]
  filteredDevices: DeviceTemplate[]
  selectedDevice: string
  onDeviceSelect: (templateId: string) => void
  onResetDeviceFilters: () => void
  hasDeviceFilters: boolean
}

export const DropdownsPanel = forwardRef<HTMLDivElement, DropdownsPanelProps>(function DropdownsPanel({
  catalogMode,
  onCatalogModeChange,
  unit,
  onUnitChange,
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
  selectedBoard,
  onBoardSelect,
  onResetBoardFilters,
  hasBoardFilters,
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
  selectedDevice,
  onDeviceSelect,
  onResetDeviceFilters,
  hasDeviceFilters,
}, ref) {
  return (
    <div ref={ref} className="floating-controls floating-dropdowns">
      <div className="unit-switch" role="group" aria-label="Units">
        <button
          type="button"
          className={`unit-btn ${unit === 'mm' ? 'active' : ''}`}
          onClick={() => onUnitChange('mm')}
          aria-pressed={unit === 'mm'}
          aria-label="Millimeters"
          title="Millimeters (grid 1 cm)"
        >
          mm
        </button>
        <button
          type="button"
          className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
          onClick={() => onUnitChange('in')}
          aria-pressed={unit === 'in'}
          aria-label="Inches"
          title="Inches (grid 1 in)"
        >
          in
        </button>
      </div>
      <div className="catalog-mode-switch" role="group" aria-label="Catalog">
        <button
          type="button"
          className={`catalog-mode-btn ${catalogMode === 'boards' ? 'active' : ''}`}
          onClick={() => onCatalogModeChange('boards')}
          aria-pressed={catalogMode === 'boards'}
          aria-label="Boards"
        >
          Boards
        </button>
        <button
          type="button"
          className={`catalog-mode-btn ${catalogMode === 'devices' ? 'active' : ''}`}
          onClick={() => onCatalogModeChange('devices')}
          aria-pressed={catalogMode === 'devices'}
          aria-label="Devices"
        >
          Devices
        </button>
      </div>

      <div className="dropdown-group catalog-content">
        {catalogMode === 'boards' && (
          <>
            <label htmlFor="board-brand-filter" className="dropdown-label">Brand</label>
            <select
              id="board-brand-filter"
              className="dropdown dropdown-filter"
              value={boardBrandFilter}
              onChange={(e) => setBoardBrandFilter(e.target.value)}
            >
              <option value="">All brands</option>
              {boardBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <label htmlFor="board-text-filter" className="dropdown-label">Search</label>
            <input
              id="board-text-filter"
              type="text"
              className="dropdown text-filter"
              placeholder="Name, brand, model…"
              value={boardTextFilter}
              onChange={(e) => setBoardTextFilter(e.target.value)}
            />
            <div className="size-filters">
              <div className="size-filter-row">
                <label className="dropdown-label">Width (mm)</label>
                <span className="size-bounds" aria-live="polite">
                  {boardWidthMin ? Number(boardWidthMin) : boardWidthRange[0]} – {boardWidthMax ? Number(boardWidthMax) : boardWidthRange[1]}
                </span>
              </div>
              <div className="size-slider-row">
                <input
                  id="board-width-min"
                  type="range"
                  className="size-slider"
                  min={boardWidthRange[0]}
                  max={boardWidthRange[1]}
                  step={5}
                  value={boardWidthMin ? Number(boardWidthMin) : boardWidthRange[0]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isLow = v === String(boardWidthRange[0])
                    setBoardWidthMin(isLow ? '' : v)
                    const num = Number(v)
                    const maxVal = boardWidthMax ? Number(boardWidthMax) : boardWidthRange[1]
                    if (!isLow && num > maxVal) setBoardWidthMax(v)
                  }}
                  aria-label="Min width (mm)"
                />
                <input
                  id="board-width-max"
                  type="range"
                  className="size-slider"
                  min={boardWidthRange[0]}
                  max={boardWidthRange[1]}
                  step={5}
                  value={boardWidthMax ? Number(boardWidthMax) : boardWidthRange[1]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isHigh = v === String(boardWidthRange[1])
                    setBoardWidthMax(isHigh ? '' : v)
                    const num = Number(v)
                    const minVal = boardWidthMin ? Number(boardWidthMin) : boardWidthRange[0]
                    if (!isHigh && num < minVal) setBoardWidthMin(v)
                  }}
                  aria-label="Max width (mm)"
                />
              </div>
              <div className="size-filter-row">
                <label className="dropdown-label">Depth (mm)</label>
                <span className="size-bounds" aria-live="polite">
                  {boardDepthMin ? Number(boardDepthMin) : boardDepthRange[0]} – {boardDepthMax ? Number(boardDepthMax) : boardDepthRange[1]}
                </span>
              </div>
              <div className="size-slider-row">
                <input
                  id="board-depth-min"
                  type="range"
                  className="size-slider"
                  min={boardDepthRange[0]}
                  max={boardDepthRange[1]}
                  step={5}
                  value={boardDepthMin ? Number(boardDepthMin) : boardDepthRange[0]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isLow = v === String(boardDepthRange[0])
                    setBoardDepthMin(isLow ? '' : v)
                    const num = Number(v)
                    const maxVal = boardDepthMax ? Number(boardDepthMax) : boardDepthRange[1]
                    if (!isLow && num > maxVal) setBoardDepthMax(v)
                  }}
                  aria-label="Min depth (mm)"
                />
                <input
                  id="board-depth-max"
                  type="range"
                  className="size-slider"
                  min={boardDepthRange[0]}
                  max={boardDepthRange[1]}
                  step={5}
                  value={boardDepthMax ? Number(boardDepthMax) : boardDepthRange[1]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isHigh = v === String(boardDepthRange[1])
                    setBoardDepthMax(isHigh ? '' : v)
                    const num = Number(v)
                    const minVal = boardDepthMin ? Number(boardDepthMin) : boardDepthRange[0]
                    if (!isHigh && num < minVal) setBoardDepthMin(v)
                  }}
                  aria-label="Max depth (mm)"
                />
              </div>
            </div>
            <label htmlFor="boards-select" className="dropdown-label">Add board</label>
            <select
              id="boards-select"
              className="dropdown dropdown-list"
              size={5}
              value={selectedBoard}
              onChange={(e) => {
                const value = e.currentTarget.value
                if (value) onBoardSelect(value)
              }}
            >
              {filteredBoards.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="filter-reset"
              onClick={onResetBoardFilters}
              disabled={!hasBoardFilters}
              title={hasBoardFilters ? 'Clear board filters' : 'No filters active'}
            >
              Reset filters
            </button>
          </>
        )}

        {catalogMode === 'devices' && (
          <>
            <label htmlFor="device-type-filter" className="dropdown-label">Type</label>
            <select
              id="device-type-filter"
              className="dropdown dropdown-filter"
              value={deviceTypeFilter}
              onChange={(e) => setDeviceTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              {DEVICE_TYPE_ORDER.map((type) => (
                <option key={type} value={type}>{DEVICE_TYPE_LABEL[type]}</option>
              ))}
            </select>
            <label htmlFor="device-brand-filter" className="dropdown-label">Brand</label>
            <select
              id="device-brand-filter"
              className="dropdown dropdown-filter"
              value={deviceBrandFilter}
              onChange={(e) => setDeviceBrandFilter(e.target.value)}
            >
              <option value="">All brands</option>
              {deviceBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <label htmlFor="device-text-filter" className="dropdown-label">Search</label>
            <input
              id="device-text-filter"
              type="text"
              className="dropdown text-filter"
              placeholder="Name, brand, model…"
              value={deviceTextFilter}
              onChange={(e) => setDeviceTextFilter(e.target.value)}
            />
            <div className="size-filters">
              <div className="size-filter-row">
                <label className="dropdown-label">Width (mm)</label>
                <span className="size-bounds" aria-live="polite">
                  {deviceWidthMin ? Number(deviceWidthMin) : deviceWidthRange[0]} – {deviceWidthMax ? Number(deviceWidthMax) : deviceWidthRange[1]}
                </span>
              </div>
              <div className="size-slider-row">
                <input
                  id="device-width-min"
                  type="range"
                  className="size-slider"
                  min={deviceWidthRange[0]}
                  max={deviceWidthRange[1]}
                  step={5}
                  value={deviceWidthMin ? Number(deviceWidthMin) : deviceWidthRange[0]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isLow = v === String(deviceWidthRange[0])
                    setDeviceWidthMin(isLow ? '' : v)
                    const num = Number(v)
                    const maxVal = deviceWidthMax ? Number(deviceWidthMax) : deviceWidthRange[1]
                    if (!isLow && num > maxVal) setDeviceWidthMax(v)
                  }}
                  aria-label="Min width (mm)"
                />
                <input
                  id="device-width-max"
                  type="range"
                  className="size-slider"
                  min={deviceWidthRange[0]}
                  max={deviceWidthRange[1]}
                  step={5}
                  value={deviceWidthMax ? Number(deviceWidthMax) : deviceWidthRange[1]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isHigh = v === String(deviceWidthRange[1])
                    setDeviceWidthMax(isHigh ? '' : v)
                    const num = Number(v)
                    const minVal = deviceWidthMin ? Number(deviceWidthMin) : deviceWidthRange[0]
                    if (!isHigh && num < minVal) setDeviceWidthMin(v)
                  }}
                  aria-label="Max width (mm)"
                />
              </div>
              <div className="size-filter-row">
                <label className="dropdown-label">Depth (mm)</label>
                <span className="size-bounds" aria-live="polite">
                  {deviceDepthMin ? Number(deviceDepthMin) : deviceDepthRange[0]} – {deviceDepthMax ? Number(deviceDepthMax) : deviceDepthRange[1]}
                </span>
              </div>
              <div className="size-slider-row">
                <input
                  id="device-depth-min"
                  type="range"
                  className="size-slider"
                  min={deviceDepthRange[0]}
                  max={deviceDepthRange[1]}
                  step={5}
                  value={deviceDepthMin ? Number(deviceDepthMin) : deviceDepthRange[0]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isLow = v === String(deviceDepthRange[0])
                    setDeviceDepthMin(isLow ? '' : v)
                    const num = Number(v)
                    const maxVal = deviceDepthMax ? Number(deviceDepthMax) : deviceDepthRange[1]
                    if (!isLow && num > maxVal) setDeviceDepthMax(v)
                  }}
                  aria-label="Min depth (mm)"
                />
                <input
                  id="device-depth-max"
                  type="range"
                  className="size-slider"
                  min={deviceDepthRange[0]}
                  max={deviceDepthRange[1]}
                  step={5}
                  value={deviceDepthMax ? Number(deviceDepthMax) : deviceDepthRange[1]}
                  onChange={(e) => {
                    const v = e.target.value
                    const isHigh = v === String(deviceDepthRange[1])
                    setDeviceDepthMax(isHigh ? '' : v)
                    const num = Number(v)
                    const minVal = deviceDepthMin ? Number(deviceDepthMin) : deviceDepthRange[0]
                    if (!isHigh && num < minVal) setDeviceDepthMin(v)
                  }}
                  aria-label="Max depth (mm)"
                />
              </div>
            </div>
            <label htmlFor="devices-select" className="dropdown-label">Add device</label>
            <select
              id="devices-select"
              className="dropdown dropdown-list"
              size={5}
              value={selectedDevice}
              onChange={(e) => {
                const value = e.currentTarget.value
                if (value) onDeviceSelect(value)
              }}
            >
              {DEVICE_TYPE_ORDER.map((deviceType) => {
                const templates = filteredDevices.filter((t) => t.type === deviceType)
                if (templates.length === 0) return null
                return (
                  <optgroup key={deviceType} label={DEVICE_TYPE_LABEL[deviceType]}>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <button
              type="button"
              className="filter-reset"
              onClick={onResetDeviceFilters}
              disabled={!hasDeviceFilters}
              title={hasDeviceFilters ? 'Clear device filters' : 'No filters active'}
            >
              Reset filters
            </button>
          </>
        )}
      </div>
    </div>
  )
})
