const MM_TO_IN = 1 / 25.4

export function formatLength(mm: number, unit: 'mm' | 'in'): string {
  if (unit === 'in') {
    const inches = mm * MM_TO_IN
    return inches >= 0.01 ? `${inches.toFixed(2)} in` : `${(inches * 1000).toFixed(0)} mil`
  }
  return mm >= 0.1 ? `${mm.toFixed(1)} mm` : `${mm.toFixed(2)} mm`
}

/** Like formatLength but includes cm in parentheses for mm unit. Useful for dimension displays. */
export function formatDimension(mm: number, unit: 'mm' | 'in'): string {
  if (unit === 'in') {
    return `${(mm * MM_TO_IN).toFixed(2)} in`
  }
  const cm = mm / 10
  return `${mm} mm (${cm.toFixed(1)} cm)`
}
