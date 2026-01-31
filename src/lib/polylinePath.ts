/**
 * Builds an SVG path d string for a polyline with rounded joins at vertices.
 * Falls back to sharp corners when segment length < radius.
 * @param points - Screen-space points (e.g. from canvas coords * zoom + pan)
 * @param radius - Join radius in the same units as points (screen px)
 */
export function buildRoundedPathD(
  points: { x: number; y: number }[],
  radius: number
): string {
  if (points.length < 2) return ''
  const first = points[0]
  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    if (next === undefined) {
      d += ` L ${curr.x} ${curr.y}`
      break
    }
    const dxIn = curr.x - prev.x
    const dyIn = curr.y - prev.y
    const L_in = Math.hypot(dxIn, dyIn)
    const dxOut = next.x - curr.x
    const dyOut = next.y - curr.y
    const L_out = Math.hypot(dxOut, dyOut)
    if (L_in < radius || L_out < radius) {
      d += ` L ${curr.x} ${curr.y}`
      continue
    }
    const dirInX = dxIn / L_in
    const dirInY = dyIn / L_in
    const dirOutX = dxOut / L_out
    const dirOutY = dyOut / L_out
    const pInX = curr.x - dirInX * radius
    const pInY = curr.y - dirInY * radius
    const pOutX = curr.x + dirOutX * radius
    const pOutY = curr.y + dirOutY * radius
    d += ` L ${pInX} ${pInY}`
    const chordLen = Math.hypot(pOutX - pInX, pOutY - pInY)
    const halfChord = chordLen / 2
    if (radius * radius >= halfChord * halfChord) {
      const dFromMid = Math.sqrt(radius * radius - halfChord * halfChord)
      const midX = (pInX + pOutX) / 2
      const midY = (pInY + pOutY) / 2
      const perpX = -(pOutY - pInY) / chordLen
      const perpY = (pOutX - pInX) / chordLen
      const toCurr = (curr.x - midX) * perpX + (curr.y - midY) * perpY
      const sign = toCurr > 0 ? 1 : -1
      const cx = midX + perpX * sign * dFromMid
      const cy = midY + perpY * sign * dFromMid
      const sweep = (pInX - cx) * (pOutY - cy) - (pInY - cy) * (pOutX - cx) > 0 ? 0 : 1
      d += ` A ${radius} ${radius} 0 0 ${sweep} ${pOutX} ${pOutY}`
    } else {
      d += ` L ${curr.x} ${curr.y}`
    }
  }
  return d
}

/** Default join radius in screen pixels; visible and larger than stroke width. */
export const DEFAULT_JOIN_RADIUS = 8
