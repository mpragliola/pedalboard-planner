import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './SelectionToolbarButton.css'

interface SelectionToolbarButtonProps {
  icon: IconDefinition
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
        <FontAwesomeIcon icon={icon} />
      </span>
    </button>
  )
}
