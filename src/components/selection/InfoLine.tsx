import './InfoLine.scss'

interface InfoLineProps {
  label: string
  value: string
}

/**
 * Displays a single line of information with a label and its corresponding value.
 * Used in the SelectionInfo component to show details about the selected item.
 * @param label - The label describing the type of information (e.g., "Name", "Type").
 * @param value - The actual value corresponding to the label (e.g., "MyFile.txt", "Folder").
 */
export function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="info-row">
      <span className="info-label">{label}:</span>
      <span className="info-value">{value}</span>
    </div>
  )
}
