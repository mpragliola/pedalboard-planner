import './HistoryButton.css'

interface HistoryButtonProps {
  icon: string
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
      {icon}
    </button>
  )
}
