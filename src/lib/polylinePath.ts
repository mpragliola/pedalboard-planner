/** Turn angle (rad) below which we use sharp corner to avoid huge radius and numeric issues. */
const MIN_TURN_RAD = 0.01

/**
 * Builds an SVG path d string for a polyline with rounded joins at vertices.
 * Arc radius is chosen so the arc spans exactly the turn angle: more collinear → smaller arc (no arc at 180°).
 * Falls back to sharp when segment length < radius or turn is effectively 0.
 * @param points - Screen-space points (e.g. from canvas coords * zoom + pan)
 * @param radius - Distance from vertex to arc endpoints along each segment (screen px)
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
    const chordLen = Math.hypot(pOutX - pInX, pOutY - pInY)
    const dot = Math.max(-1, Math.min(1, dirInX * dirOutX + dirInY * dirOutY))
    const turnAngleRad = Math.acos(dot)
    if (turnAngleRad < MIN_TURN_RAD) {
      d += ` L ${curr.x} ${curr.y}`
      continue
    }
    const halfTurn = turnAngleRad / 2
    const sinHalf = Math.sin(halfTurn)
    if (sinHalf < 1e-6) {
      d += ` L ${curr.x} ${curr.y}`
      continue
    }
    const arcRadius = chordLen / (2 * sinHalf)
    const dFromMid = arcRadius * Math.cos(halfTurn)
    const midX = (pInX + pOutX) / 2
    const midY = (pInY + pOutY) / 2
    const perpX = -(pOutY - pInY) / chordLen
    const perpY = (pOutX - pInX) / chordLen
    const toCurr = (curr.x - midX) * perpX + (curr.y - midY) * perpY
    const sign = toCurr > 0 ? 1 : -1
    const cx = midX + perpX * sign * dFromMid
    const cy = midY + perpY * sign * dFromMid
    const sweep = (pInX - cx) * (pOutY - cy) - (pInY - cy) * (pOutX - cx) > 0 ? 0 : 1
    d += ` L ${pInX} ${pInY}`
    d += ` A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${pOutX} ${pOutY}`
  }
  return d
}

/** Default join radius in screen pixels; visible and larger than stroke width. */
export const DEFAULT_JOIN_RADIUS = 8
