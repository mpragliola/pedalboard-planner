import './ZoomButton.css'

interface ZoomButtonProps {
  label: string
  title: string
  icon: string
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
      {icon}
    </button>
  )
}
