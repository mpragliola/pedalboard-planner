import { forwardRef, useState, useEffect } from 'react'
import { DEVICE_TYPE_ORDER, DEVICE_TYPE_LABEL } from '../../constants'
import { useApp } from '../../context/AppContext'
import { UnitSwitch } from './UnitSwitch'
import { CatalogModeSwitch } from './CatalogModeSwitch'
import { TextFilter } from './TextFilter'
import { CatalogList, CatalogListGrouped } from './CatalogList'
import { CatalogModal, type CatalogModalMode } from './CatalogModal'
import { SizeFilters } from './SizeFilters'
import './DropdownsPanel.css'

export type { CatalogMode } from './CatalogModeSwitch'

const PHONE_MEDIA = '(max-width: 767px)'

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_MEDIA).matches
  )
  useEffect(() => {
    const m = window.matchMedia(PHONE_MEDIA)
    const fn = () => setIsPhone(m.matches)
    m.addEventListener('change', fn)
    return () => m.removeEventListener('change', fn)
  }, [])
  return isPhone
}

export const DropdownsPanel = forwardRef<HTMLDivElement>(function DropdownsPanel(_props, ref) {
  const {
    catalogMode,
    setCatalogMode,
    unit,
    setUnit,
    filters,
    onBoardSelect,
    onDeviceSelect,
    onCustomBoardCreate,
    onCustomDeviceCreate,
  } = useApp()

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
    selectedBoard,
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
    selectedDevice,
    resetDeviceFilters,
  } = filters

  const isPhone = useIsPhone()
  const listSize = isPhone ? 1 : 5

  const [catalogModalOpen, setCatalogModalOpen] = useState(false)
  const { setSelectedBoard, setSelectedDevice } = filters

  const [customBoardForm, setCustomBoardForm] = useState({
    widthMm: 400,
    depthMm: 200,
    color: '#484852',
    name: '',
  })
  const [customDeviceForm, setCustomDeviceForm] = useState({
    widthMm: 75,
    depthMm: 120,
    color: '#484852',
    name: '',
  })

  useEffect(() => {
    setSelectedBoard('')
    setSelectedDevice('')
  }, [setSelectedBoard, setSelectedDevice])

  const openCatalogModal = (mode: CatalogModalMode) => {
    setCatalogMode(mode)
    setCatalogModalOpen(true)
  }

  const hasBoardFilters = !!(
    boardBrandFilter ||
    boardTextFilter ||
    boardWidthMin ||
    boardWidthMax ||
    boardDepthMin ||
    boardDepthMax
  )
  const hasDeviceFilters = !!(
    deviceBrandFilter ||
    deviceTypeFilter ||
    deviceTextFilter ||
    deviceWidthMin ||
    deviceWidthMax ||
    deviceDepthMin ||
    deviceDepthMax
  )

  const formatSliderValue = (mm: number) =>
    unit === 'in' ? (mm / 25.4).toFixed(2) : String(Math.round(mm))
  const unitLabel = unit === 'in' ? 'in' : 'mm'

  const handleBoardWidthMin = (v: string) => {
    const isLow = v === String(boardWidthRange[0])
    setBoardWidthMin(isLow ? '' : v)
    const num = Number(v)
    const maxVal = boardWidthMax ? Number(boardWidthMax) : boardWidthRange[1]
    if (!isLow && num > maxVal) setBoardWidthMax(v)
  }
  const handleBoardWidthMax = (v: string) => {
    const isHigh = v === String(boardWidthRange[1])
    setBoardWidthMax(isHigh ? '' : v)
    const num = Number(v)
    const minVal = boardWidthMin ? Number(boardWidthMin) : boardWidthRange[0]
    if (!isHigh && num < minVal) setBoardWidthMin(v)
  }
  const handleBoardDepthMin = (v: string) => {
    const isLow = v === String(boardDepthRange[0])
    setBoardDepthMin(isLow ? '' : v)
    const num = Number(v)
    const maxVal = boardDepthMax ? Number(boardDepthMax) : boardDepthRange[1]
    if (!isLow && num > maxVal) setBoardDepthMax(v)
  }
  const handleBoardDepthMax = (v: string) => {
    const isHigh = v === String(boardDepthRange[1])
    setBoardDepthMax(isHigh ? '' : v)
    const num = Number(v)
    const minVal = boardDepthMin ? Number(boardDepthMin) : boardDepthRange[0]
    if (!isHigh && num < minVal) setBoardDepthMin(v)
  }
  const handleDeviceWidthMin = (v: string) => {
    const isLow = v === String(deviceWidthRange[0])
    setDeviceWidthMin(isLow ? '' : v)
    const num = Number(v)
    const maxVal = deviceWidthMax ? Number(deviceWidthMax) : deviceWidthRange[1]
    if (!isLow && num > maxVal) setDeviceWidthMax(v)
  }
  const handleDeviceWidthMax = (v: string) => {
    const isHigh = v === String(deviceWidthRange[1])
    setDeviceWidthMax(isHigh ? '' : v)
    const num = Number(v)
    const minVal = deviceWidthMin ? Number(deviceWidthMin) : deviceWidthRange[0]
    if (!isHigh && num < minVal) setDeviceWidthMin(v)
  }
  const handleDeviceDepthMin = (v: string) => {
    const isLow = v === String(deviceDepthRange[0])
    setDeviceDepthMin(isLow ? '' : v)
    const num = Number(v)
    const maxVal = deviceDepthMax ? Number(deviceDepthMax) : deviceDepthRange[1]
    if (!isLow && num > maxVal) setDeviceDepthMax(v)
  }
  const handleDeviceDepthMax = (v: string) => {
    const isHigh = v === String(deviceDepthRange[1])
    setDeviceDepthMax(isHigh ? '' : v)
    const num = Number(v)
    const minVal = deviceDepthMin ? Number(deviceDepthMin) : deviceDepthRange[0]
    if (!isHigh && num < minVal) setDeviceDepthMin(v)
  }

  const deviceGroups = DEVICE_TYPE_ORDER.map((deviceType) => {
    const templates = filteredDevices.filter((t) => t.type === deviceType)
    if (templates.length === 0) return null
    return {
      label: DEVICE_TYPE_LABEL[deviceType],
      options: templates.map((t) => ({ id: t.id, name: t.name, type: t.type })),
    }
  }).filter(Boolean) as { label: string; options: { id: string; name: string; type: string }[] }[]

  return (
    <div ref={ref} className="floating-controls floating-dropdowns">
      <div className="catalog-switches-row">
        <UnitSwitch value={unit} onChange={setUnit} />
        <CatalogModeSwitch value={catalogMode} onChange={setCatalogMode} />
      </div>

      <div className="dropdown-group catalog-content">
        {catalogMode === 'boards' && (
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
              widthMin={boardWidthMin ?? ''}
              widthMax={boardWidthMax ?? ''}
              onWidthMinChange={handleBoardWidthMin}
              onWidthMaxChange={handleBoardWidthMax}
              depthRange={boardDepthRange}
              depthMin={boardDepthMin ?? ''}
              depthMax={boardDepthMax ?? ''}
              onDepthMinChange={handleBoardDepthMin}
              onDepthMaxChange={handleBoardDepthMax}
              formatSliderValue={formatSliderValue}
            />
            <div className="catalog-add-row">
              <label className="dropdown-label">Add board</label>
              <button
                type="button"
                className={`catalog-browse-btn${catalogModalOpen && catalogMode === 'boards' ? ' open' : ''}`}
                onClick={() => openCatalogModal('boards')}
                title="Browse boards with images"
                aria-label="Browse boards with images"
              >
                <span className="catalog-browse-icon" aria-hidden>▦</span>
              </button>
            </div>
            <CatalogList
              id="boards-select"
              label=""
              size={listSize}
              value={selectedBoard}
              options={filteredBoards.map((t) => ({ id: t.id, name: t.name }))}
              onChange={onBoardSelect}
            />
            <button
              type="button"
              className="filter-reset"
              onClick={resetBoardFilters}
              disabled={!hasBoardFilters}
              title={hasBoardFilters ? 'Clear board filters' : 'No filters active'}
            >
              Reset filters
            </button>
            <div className="custom-section">
              <h3 className="custom-section-title">Custom board</h3>
              <div className="custom-form-row">
                <label htmlFor="custom-board-width" className="dropdown-label">
                  Width ({unitLabel})
                </label>
                <input
                  id="custom-board-width"
                  type="number"
                  min={1}
                  max={2000}
                  className="custom-input"
                  value={unit === 'in' ? (customBoardForm.widthMm / 25.4).toFixed(2) : String(customBoardForm.widthMm)}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = unit === 'in' ? Math.round(parseFloat(v || '0') * 25.4) : parseInt(v || '0', 10)
                    if (!Number.isNaN(num)) setCustomBoardForm((f) => ({ ...f, widthMm: Math.max(1, num) }))
                  }}
                />
              </div>
              <div className="custom-form-row">
                <label htmlFor="custom-board-depth" className="dropdown-label">
                  Depth ({unitLabel})
                </label>
                <input
                  id="custom-board-depth"
                  type="number"
                  min={1}
                  max={2000}
                  className="custom-input"
                  value={unit === 'in' ? (customBoardForm.depthMm / 25.4).toFixed(2) : String(customBoardForm.depthMm)}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = unit === 'in' ? Math.round(parseFloat(v || '0') * 25.4) : parseInt(v || '0', 10)
                    if (!Number.isNaN(num)) setCustomBoardForm((f) => ({ ...f, depthMm: Math.max(1, num) }))
                  }}
                />
              </div>
              <div className="custom-form-row">
                <label htmlFor="custom-board-color" className="dropdown-label">
                  Color
                </label>
                <input
                  id="custom-board-color"
                  type="color"
                  className="custom-color-input"
                  value={customBoardForm.color}
                  onChange={(e) => setCustomBoardForm((f) => ({ ...f, color: e.target.value }))}
                />
              </div>
              <div className="custom-form-row">
                <label htmlFor="custom-board-name" className="dropdown-label">
                  Name
                </label>
                <input
                  id="custom-board-name"
                  type="text"
                  className="custom-input"
                  placeholder="Custom board"
                  value={customBoardForm.name}
                  onChange={(e) => setCustomBoardForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <button
                type="button"
                className="custom-create-btn"
                onClick={() => {
                  onCustomBoardCreate({
                    widthMm: customBoardForm.widthMm,
                    depthMm: customBoardForm.depthMm,
                    color: customBoardForm.color,
                    name: customBoardForm.name,
                  })
                }}
              >
                Create
              </button>
            </div>
          </>
        )}

        {catalogMode === 'devices' && (
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
              widthMin={deviceWidthMin ?? ''}
              widthMax={deviceWidthMax ?? ''}
              onWidthMinChange={handleDeviceWidthMin}
              onWidthMaxChange={handleDeviceWidthMax}
              depthRange={deviceDepthRange}
              depthMin={deviceDepthMin ?? ''}
              depthMax={deviceDepthMax ?? ''}
              onDepthMinChange={handleDeviceDepthMin}
              onDepthMaxChange={handleDeviceDepthMax}
              formatSliderValue={formatSliderValue}
            />
            <div className="catalog-add-row">
              <label className="dropdown-label">Add device</label>
              <button
                type="button"
                className={`catalog-browse-btn${catalogModalOpen && catalogMode === 'devices' ? ' open' : ''}`}
                onClick={() => openCatalogModal('devices')}
                title="Browse devices with images"
                aria-label="Browse devices with images"
              >
                <span className="catalog-browse-icon" aria-hidden>▦</span>
              </button>
            </div>
            <CatalogListGrouped
              id="devices-select"
              label=""
              size={listSize}
              value={selectedDevice}
              groups={deviceGroups}
              onChange={onDeviceSelect}
            />
            <button
              type="button"
              className="filter-reset"
              onClick={resetDeviceFilters}
              disabled={!hasDeviceFilters}
              title={hasDeviceFilters ? 'Clear device filters' : 'No filters active'}
            >
              Reset filters
            </button>
            <div className="custom-section">
              <h3 className="custom-section-title">Custom device</h3>
              <div className="custom-form-row">
                <label htmlFor="custom-device-width" className="dropdown-label">
                  Width ({unitLabel})
                </label>
                <input
                  id="custom-device-width"
                  type="number"
                  min={1}
                  max={2000}
                  className="custom-input"
                  value={unit === 'in' ? (customDeviceForm.widthMm / 25.4).toFixed(2) : String(customDeviceForm.widthMm)}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = unit === 'in' ? Math.round(parseFloat(v || '0') * 25.4) : parseInt(v || '0', 10)
                    if (!Number.isNaN(num)) setCustomDeviceForm((f) => ({ ...f, widthMm: Math.max(1, num) }))
                  }}
                />
              </div>
              <div className="custom-form-row">
                <label htmlFor="custom-device-depth" className="dropdown-label">
                  Depth ({unitLabel})
                </label>
                <input
                  id="custom-device-depth"
                  type="number"
                  min={1}
                  max={2000}
                  className="custom-input"
                  value={unit === 'in' ? (customDeviceForm.depthMm / 25.4).toFixed(2) : String(customDeviceForm.depthMm)}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = unit === 'in' ? Math.round(parseFloat(v || '0') * 25.4) : parseInt(v || '0', 10)
                    if (!Number.isNaN(num)) setCustomDeviceForm((f) => ({ ...f, depthMm: Math.max(1, num) }))
                  }}
                />
              </div>
              <div className="custom-form-row">
                <label htmlFor="custom-device-color" className="dropdown-label">
                  Color
                </label>
                <input
                  id="custom-device-color"
                  type="color"
                  className="custom-color-input"
                  value={customDeviceForm.color}
                  onChange={(e) => setCustomDeviceForm((f) => ({ ...f, color: e.target.value }))}
                />
              </div>
              <div className="custom-form-row">
                <label htmlFor="custom-device-name" className="dropdown-label">
                  Name
                </label>
                <input
                  id="custom-device-name"
                  type="text"
                  className="custom-input"
                  placeholder="Custom device"
                  value={customDeviceForm.name}
                  onChange={(e) => setCustomDeviceForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <button
                type="button"
                className="custom-create-btn"
                onClick={() => {
                  onCustomDeviceCreate({
                    widthMm: customDeviceForm.widthMm,
                    depthMm: customDeviceForm.depthMm,
                    color: customDeviceForm.color,
                    name: customDeviceForm.name,
                  })
                }}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
      <CatalogModal
        open={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
      />
    </div>
  )
})
