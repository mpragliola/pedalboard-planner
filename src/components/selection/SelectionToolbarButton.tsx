import './SelectionToolbarButton.css'

interface SelectionToolbarButtonProps {
  icon: string
  title: string
  ariaLabel: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
}

export function SelectionToolbarButton({
  icon,
  title,
  ariaLabel,
  onClick,
  danger = false,
}: SelectionToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`selection-toolbar-btn ${danger ? 'selection-toolbar-btn-danger' : ''}`.trim()}
      title={title}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="selection-toolbar-btn-icon" aria-hidden>
        {icon}
      </span>
    </button>
  )
}
