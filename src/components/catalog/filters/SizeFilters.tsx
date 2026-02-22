import './SizeFilters.scss'
import * as Slider from "@radix-ui/react-slider"

export type SizeAxis = "width" | "depth"
export type SizeRange = readonly [number, number]

interface SizeFiltersProps {
  unitLabel: string
  widthRange: readonly [number, number]
  widthMin: string
  widthMax: string
  depthRange: readonly [number, number]
  depthMin: string
  depthMax: string
  onRangeChange: (axis: SizeAxis, range: SizeRange) => void
  formatSliderValue: (mm: number) => string
}

function normalizeSliderValues(values: number[], fallback: SizeRange): SizeRange {
  const first = values[0] ?? fallback[0]
  const second = values[1] ?? fallback[1]
  return first <= second ? [first, second] : [second, first]
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
          <Slider.Root
            className="size-slider"
            min={widthRange[0]}
            max={widthRange[1]}
            step={5}
            minStepsBetweenThumbs={0}
            value={[widthMinVal, widthMaxVal]}
            onValueChange={(values: number[]) =>
              onRangeChange("width", normalizeSliderValues(values, [widthMinVal, widthMaxVal]))
            }
          >
            <Slider.Track className="size-slider-track">
              <Slider.Range className="size-slider-range" />
            </Slider.Track>
            <Slider.Thumb className="size-slider-thumb" aria-label={`Min width (${unitLabel})`} />
            <Slider.Thumb className="size-slider-thumb" aria-label={`Max width (${unitLabel})`} />
          </Slider.Root>
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
          <Slider.Root
            className="size-slider"
            min={depthRange[0]}
            max={depthRange[1]}
            step={5}
            minStepsBetweenThumbs={0}
            value={[depthMinVal, depthMaxVal]}
            onValueChange={(values: number[]) =>
              onRangeChange("depth", normalizeSliderValues(values, [depthMinVal, depthMaxVal]))
            }
          >
            <Slider.Track className="size-slider-track">
              <Slider.Range className="size-slider-range" />
            </Slider.Track>
            <Slider.Thumb className="size-slider-thumb" aria-label={`Min depth (${unitLabel})`} />
            <Slider.Thumb className="size-slider-thumb" aria-label={`Max depth (${unitLabel})`} />
          </Slider.Root>
        </div>
      </div>
    </div>
  )
}
