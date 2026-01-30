import './SizeFilters.css'

interface SizeFiltersProps {
  unitLabel: string
  widthRange: readonly [number, number]
  widthMin: string
  widthMax: string
  onWidthMinChange: (value: string) => void
  onWidthMaxChange: (value: string) => void
  depthRange: readonly [number, number]
  depthMin: string
  depthMax: string
  onDepthMinChange: (value: string) => void
  onDepthMaxChange: (value: string) => void
  formatSliderValue: (mm: number) => string
}

export function SizeFilters({
  unitLabel,
  widthRange,
  widthMin,
  widthMax,
  onWidthMinChange,
  onWidthMaxChange,
  depthRange,
  depthMin,
  depthMax,
  onDepthMinChange,
  onDepthMaxChange,
  formatSliderValue,
}: SizeFiltersProps) {
  const [widthMinVal, widthMaxVal] = [
    widthMin ? Number(widthMin) : widthRange[0],
    widthMax ? Number(widthMax) : widthRange[1],
  ]
  const [depthMinVal, depthMaxVal] = [
    depthMin ? Number(depthMin) : depthRange[0],
    depthMax ? Number(depthMax) : depthRange[1],
  ]

  return (
    <div className="size-filters">
      <div className="size-filter-block size-filter-width">
        <div className="size-filter-row">
          <label className="dropdown-label">Width ({unitLabel})</label>
          <span className="size-bounds" aria-live="polite">
            {formatSliderValue(widthMinVal)} – {formatSliderValue(widthMaxVal)}
          </span>
        </div>
        <div className="size-slider-row">
          <input
            type="range"
            className="size-slider"
            min={widthRange[0]}
            max={widthRange[1]}
            step={5}
            value={widthMinVal}
            onChange={(e) => onWidthMinChange(e.target.value)}
            aria-label={`Min width (${unitLabel})`}
          />
          <input
            type="range"
            className="size-slider"
            min={widthRange[0]}
            max={widthRange[1]}
            step={5}
            value={widthMaxVal}
            onChange={(e) => onWidthMaxChange(e.target.value)}
            aria-label={`Max width (${unitLabel})`}
          />
        </div>
      </div>
      <div className="size-filter-block size-filter-depth">
        <div className="size-filter-row">
          <label className="dropdown-label">Depth ({unitLabel})</label>
          <span className="size-bounds" aria-live="polite">
            {formatSliderValue(depthMinVal)} – {formatSliderValue(depthMaxVal)}
          </span>
        </div>
        <div className="size-slider-row">
          <input
            type="range"
            className="size-slider"
            min={depthRange[0]}
            max={depthRange[1]}
            step={5}
            value={depthMinVal}
            onChange={(e) => onDepthMinChange(e.target.value)}
            aria-label={`Min depth (${unitLabel})`}
          />
          <input
            type="range"
            className="size-slider"
            min={depthRange[0]}
            max={depthRange[1]}
            step={5}
            value={depthMaxVal}
            onChange={(e) => onDepthMaxChange(e.target.value)}
            aria-label={`Max depth (${unitLabel})`}
          />
        </div>
      </div>
    </div>
  )
}
