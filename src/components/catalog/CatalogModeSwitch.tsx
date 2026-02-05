import './CatalogModeSwitch.scss'

export type CatalogMode = 'boards' | 'devices'

interface CatalogModeSwitchProps {
  value: CatalogMode
  onChange: (mode: CatalogMode) => void
}

const OPTIONS: { value: CatalogMode; label: string; ariaLabel: string }[] = [
  { value: 'boards', label: 'Boards', ariaLabel: 'Boards' },
  { value: 'devices', label: 'Devices', ariaLabel: 'Devices' },
]

export function CatalogModeSwitch({ value, onChange }: CatalogModeSwitchProps) {
  return (
    <div className="catalog-mode-switch" role="group" aria-label="Catalog">
      {OPTIONS.map(({ value: optValue, label, ariaLabel }) => (
        <button
          key={optValue}
          type="button"
          className={`catalog-mode-btn ${value === optValue ? 'active' : ''}`}
          onClick={() => onChange(optValue)}
          aria-pressed={value === optValue}
          aria-label={ariaLabel}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
