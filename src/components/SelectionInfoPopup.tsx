import { useApp } from '../context/AppContext'

export function SelectionInfoPopup() {
  const { objects, selectedObjectIds, unit } = useApp()

  const selectedObject =
    selectedObjectIds.length === 1 ? objects.find((o) => o.id === selectedObjectIds[0]) : null

  if (!selectedObject) return null

  const formatDimension = (mm: number) => {
    if (unit === 'in') {
      const inches = mm / 25.4
      return `${inches.toFixed(2)} in`
    }
    // For 'mm', we can show both mm and cm if mm is large enough
    const cm = mm / 10
    return `${mm} mm (${cm.toFixed(1)} cm)`
  }

  return (
    <div className="selection-info-popup">
      <div className="info-title">{selectedObject.name}</div>
      <div className="info-row">
        <span className="info-label">Width:</span>
        <span className="info-value">{formatDimension(selectedObject.width)}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Depth:</span>
        <span className="info-value">{formatDimension(selectedObject.depth)}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Height:</span>
        <span className="info-value">{formatDimension(selectedObject.height)}</span>
      </div>
    </div>
  )
}
