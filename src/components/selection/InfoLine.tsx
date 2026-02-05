import './InfoLine.scss'

interface InfoLineProps {
  label: string
  value: string
}

export function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="info-row">
      <span className="info-label">{label}:</span>
      <span className="info-value">{value}</span>
    </div>
  )
}
