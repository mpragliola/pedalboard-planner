import { useRef, useLayoutEffect } from 'react'
import './CatalogList.css'

export interface CatalogListOption {
  id: string
  name: string
}

interface CatalogListProps {
  id: string
  label: string
  size: number
  options: CatalogListOption[]
  onAdd: (id: string) => void
}

export function CatalogList({
  id,
  label,
  size,
  options,
  onAdd,
}: CatalogListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const scrollRestoreRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const el = listRef.current
    const saved = scrollRestoreRef.current
    if (el && saved !== null) {
      el.scrollTop = saved
      scrollRestoreRef.current = null
    }
  })

  const handleAdd = (optId: string) => {
    if (listRef.current) scrollRestoreRef.current = listRef.current.scrollTop
    onAdd(optId)
  }

  return (
    <>
      {label ? (
        <label id={`${id}-label`} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <div
        ref={listRef}
        id={id}
        className="catalog-list"
        role="listbox"
        aria-label={label || 'Add board'}
        style={{ minHeight: size * 28 }}
      >
        {options.length === 0 ? (
          <div className="catalog-list-empty">No matches</div>
        ) : (
          options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="option"
              className="catalog-list-item"
              onClick={() => handleAdd(opt.id)}
              title={`Add ${opt.name}`}
            >
              {opt.name}
            </button>
          ))
        )}
      </div>
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
  groups: { label: string; options: CatalogListGroupOption[] }[]
  onAdd: (id: string) => void
}

export function CatalogListGrouped({
  id,
  label,
  size,
  groups,
  onAdd,
}: CatalogListGroupedProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const scrollRestoreRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const el = listRef.current
    const saved = scrollRestoreRef.current
    if (el && saved !== null) {
      el.scrollTop = saved
      scrollRestoreRef.current = null
    }
  })

  const handleAdd = (optId: string) => {
    if (listRef.current) scrollRestoreRef.current = listRef.current.scrollTop
    onAdd(optId)
  }

  return (
    <>
      {label ? (
        <label id={`${id}-label`} className="dropdown-label">
          {label}
        </label>
      ) : null}
      <div
        ref={listRef}
        id={id}
        className="catalog-list"
        role="listbox"
        aria-label={label || 'Add device'}
        style={{ minHeight: size * 28 }}
      >
        {groups.every((g) => g.options.length === 0) ? (
          <div className="catalog-list-empty">No matches</div>
        ) : (
          groups.map(({ label: groupLabel, options: groupOptions }) =>
            groupOptions.length > 0 ? (
              <div key={groupLabel} className="catalog-list-group">
                <div className="catalog-list-group-label">{groupLabel}</div>
                {groupOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    className="catalog-list-item"
                    onClick={() => handleAdd(opt.id)}
                    title={`Add ${opt.name}`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            ) : null
          )
        )}
      </div>
    </>
  )
}
