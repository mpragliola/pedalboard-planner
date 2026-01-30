import './UnitSwitch.css'

export type Unit = 'mm' | 'in'

interface UnitSwitchProps {
  value: Unit
  onChange: (unit: Unit) => void
}

export function UnitSwitch({ value, onChange }: UnitSwitchProps) {
  return (
    <div className="unit-switch" role="group" aria-label="Units">
      <button
        type="button"
        className={`unit-btn ${value === 'mm' ? 'active' : ''}`}
        onClick={() => onChange('mm')}
        aria-pressed={value === 'mm'}
        aria-label="Millimeters"
        title="Millimeters (grid 1 cm)"
      >
        mm
      </button>
      <button
        type="button"
        className={`unit-btn ${value === 'in' ? 'active' : ''}`}
        onClick={() => onChange('in')}
        aria-pressed={value === 'in'}
        aria-label="Inches"
        title="Inches (grid 1 in)"
      >
        in
      </button>
    </div>
  )
}
