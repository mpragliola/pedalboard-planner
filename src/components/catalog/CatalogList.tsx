import './CatalogList.css'

export interface CatalogListOption {
  id: string
  name: string
}

interface CatalogListProps {
  id: string
  label: string
  size: number
  value: string
  options: CatalogListOption[]
  onChange: (id: string) => void
}

export function CatalogList({
  id,
  label,
  size,
  value,
  options,
  onChange,
}: CatalogListProps) {
  return (
    <>
      {label ? (
        <label htmlFor={id} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className="dropdown dropdown-list"
        size={size}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </>
  )
}

export interface CatalogListGroupOption {
  id: string
  name: string
  type: string
}

interface CatalogListGroupedProps {
  id: string
  label: string
  size: number
  value: string
  groups: { label: string; options: CatalogListGroupOption[] }[]
  onChange: (id: string) => void
}

export function CatalogListGrouped({
  id,
  label,
  size,
  value,
  groups,
  onChange,
}: CatalogListGroupedProps) {
  return (
    <>
      {label ? (
        <label htmlFor={id} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className="dropdown dropdown-list"
        size={size}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {groups.map(({ label: groupLabel, options: groupOptions }) => (
          <optgroup key={groupLabel} label={groupLabel}>
            {groupOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </>
  )
}
