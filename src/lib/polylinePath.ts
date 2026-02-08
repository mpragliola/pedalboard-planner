import { clamp } from "./math"
import { vec2Add, vec2Cross, vec2Dot, vec2Length, vec2Scale, vec2Sub, type Vec2 } from "./vector"
/** Turn angle (rad) below which we use sharp corner to avoid huge radius and numeric issues. */
const MIN_TURN_RAD = 0.01

/**
 * Builds an SVG path d string for a polyline with rounded joins at vertices.
 * Rounded joints are obtained by using circular arcs tangent to the incoming
 * and outgoing segments, with the arc endpoints located at a distance of
 * `radius` from the vertex along each segment.
 * @param points - Screen-space points (e.g. from canvas coords * zoom + pan)
 * @param radius - Distance from vertex to arc endpoints along each segment (screen px)
 */
export function buildRoundedPathD(
  points: Vec2[],
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
    const inVec = vec2Sub(curr, prev)
    const outVec = vec2Sub(next, curr)
    const L_in = vec2Length(inVec)
    const L_out = vec2Length(outVec)
    if (L_in < radius || L_out < radius) {
      d += ` L ${curr.x} ${curr.y}`
      continue
    }
    const dirIn = vec2Scale(inVec, 1 / L_in)
    const dirOut = vec2Scale(outVec, 1 / L_out)
    const pIn = vec2Sub(curr, vec2Scale(dirIn, radius))
    const pOut = vec2Add(curr, vec2Scale(dirOut, radius))
    const chord = vec2Sub(pOut, pIn)
    const chordLen = vec2Length(chord)
    const dot = clamp(vec2Dot(dirIn, dirOut), -1, 1)
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
    const mid = vec2Scale(vec2Add(pIn, pOut), 0.5)
    const perp = { x: -chord.y / chordLen, y: chord.x / chordLen }
    const toCurr = (curr.x - mid.x) * perp.x + (curr.y - mid.y) * perp.y
    const sign = toCurr > 0 ? 1 : -1
    const center = vec2Add(mid, vec2Scale(perp, sign * dFromMid))
    const sweep = vec2Cross(vec2Sub(pIn, center), vec2Sub(pOut, center)) > 0 ? 0 : 1
    d += ` L ${pIn.x} ${pIn.y}`
    d += ` A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${pOut.x} ${pOut.y}`
  }
  return d
}

/** Default join radius in screen pixels; visible8and larger than stroke width. */
export const DEFAULT_JOIN_RADIUS = 12;

/**
 * Build a smooth SVG path through points using Catmull-Rom → cubic Bezier conversion.
 * Produces a C1-continuous curve that passes through every point – ideal for rendering
 * a physics rope chain as a cable.
 */
export function buildSmoothPathD(points: Vec2[]): string {
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
