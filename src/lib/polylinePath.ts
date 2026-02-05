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

/**
 * Build a smooth SVG path through points using Catmull-Rom → cubic Bezier conversion.
 * Produces a C1-continuous curve that passes through every point – ideal for rendering
 * a physics rope chain as a cable.
 */
export function buildSmoothPathD(points: { x: number; y: number }[]): string {
  const n = points.length
  if (n < 2) return ''
  if (n === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(n - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}
