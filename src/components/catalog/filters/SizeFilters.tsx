import './SizeFilters.scss'
import { Slider } from '../../common/Slider'

export type SizeAxis = "width" | "depth"
export type SizeBound = "min" | "max"

interface SizeFiltersProps {
  unitLabel: string
  widthRange: readonly [number, number]
  widthMin: string
  widthMax: string
  depthRange: readonly [number, number]
  depthMin: string
  depthMax: string
  onRangeChange: (axis: SizeAxis, bound: SizeBound, value: string) => void
  formatSliderValue: (mm: number) => string
}

export function SizeFilters({
  unitLabel,
  widthRange,
  widthMin,
  widthMax,
  depthRange,
  depthMin,
  depthMax,
  onRangeChange,
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
          <Slider
            className="size-slider"
            min={widthRange[0]}
            max={widthRange[1]}
            step={5}
            value={widthMinVal}
            onValueChange={(value) => onRangeChange("width", "min", value)}
            aria-label={`Min width (${unitLabel})`}
          />
          <Slider
            className="size-slider"
            min={widthRange[0]}
            max={widthRange[1]}
            step={5}
            value={widthMaxVal}
            onValueChange={(value) => onRangeChange("width", "max", value)}
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
          <Slider
            className="size-slider"
            min={depthRange[0]}
            max={depthRange[1]}
            step={5}
            value={depthMinVal}
            onValueChange={(value) => onRangeChange("depth", "min", value)}
            aria-label={`Min depth (${unitLabel})`}
          />
          <Slider
            className="size-slider"
            min={depthRange[0]}
            max={depthRange[1]}
            step={5}
            value={depthMaxVal}
            onValueChange={(value) => onRangeChange("depth", "max", value)}
            aria-label={`Max depth (${unitLabel})`}
          />
        </div>
      </div>
    </div>
  )
}
