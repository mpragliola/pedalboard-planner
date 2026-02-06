import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './SideControl.scss'

interface SideControlProps {
  label: string
  title: string
  icon: IconDefinition
  onClick: () => void
  active?: boolean
  className?: string
}

export function SideControl({
  label,
  title,
  icon,
  onClick,
  active = false,
  className = '',
}: SideControlProps) {
  return (
    <button
      type="button"
      className={`side-control ${active ? 'active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-label={label}
      title={title}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}
