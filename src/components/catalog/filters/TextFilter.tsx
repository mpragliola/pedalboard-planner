import { useRef } from "react";
import './TextFilter.scss'

interface TextFilterProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function TextFilter({
  id,
  label,
  placeholder,
  value,
  onChange,
}: TextFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const clearFilter = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <>
      <label htmlFor={id} className="dropdown-label">
        {label}
      </label>
      <div className="text-filter-wrapper">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="dropdown text-filter"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value ? (
          <button
            type="button"
            className="text-filter-clear"
            aria-label="Clear text filter"
            title="Clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearFilter}
          >
            ×
          </button>
        ) : null}
      </div>
    </>
  )
}
