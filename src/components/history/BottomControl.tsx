import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './BottomControl.scss'

interface BottomControlProps {
  icon: IconDefinition
  title: string
  ariaLabel: string
  onClick: () => void
  disabled: boolean
}

export function BottomControl({
  icon,
  title,
  ariaLabel,
  onClick,
  disabled,
}: BottomControlProps) {
  return (
    <button
      type="button"
      className="bottom-control"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}
