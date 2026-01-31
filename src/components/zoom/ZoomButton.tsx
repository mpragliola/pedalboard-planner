import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './ZoomButton.css'

interface ZoomButtonProps {
  label: string
  title: string
  icon: IconDefinition
  onClick: () => void
  active?: boolean
  className?: string
}

export function ZoomButton({
  label,
  title,
  icon,
  onClick,
  active = false,
  className = '',
}: ZoomButtonProps) {
  return (
    <button
      type="button"
      className={`zoom-btn ${active ? 'active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-label={label}
      title={title}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}
