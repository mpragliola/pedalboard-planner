import './TextFilter.css'

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
  return (
    <>
      <label htmlFor={id} className="dropdown-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="dropdown text-filter"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  )
}
