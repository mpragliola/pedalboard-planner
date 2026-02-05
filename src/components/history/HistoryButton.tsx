import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './HistoryButton.scss'

interface HistoryButtonProps {
  icon: IconDefinition
  title: string
  ariaLabel: string
  onClick: () => void
  disabled: boolean
}

export function HistoryButton({
  icon,
  title,
  ariaLabel,
  onClick,
  disabled,
}: HistoryButtonProps) {
  return (
    <button
      type="button"
      className="history-btn"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}
