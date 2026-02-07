/** Canvas 2D drawing primitives for flat and texture-mapped faces. */
import { vec2Cross, vec2Multiply, vec2Sub, type Vec2 } from "./vector";

// 2D canvas drawing helpers for textured and flat faces.
export type Mat2D = { a: number; b: number; c: number; d: number; e: number; f: number };

/** Affine matrix mapping source triangle coordinates into destination triangle coordinates. */
export function triangleTransform(
  s0: Vec2,
  s1: Vec2,
  s2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2
): Mat2D {
  // Solve affine transform from edge vectors: A = D * inverse(S), t = d0 - A*s0.
  const s10 = vec2Sub(s1, s0);
  const s20 = vec2Sub(s2, s0);
  const denom = vec2Cross(s10, s20);
  if (Math.abs(denom) < 1e-6) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  const d10 = vec2Sub(d1, d0);
  const d20 = vec2Sub(d2, d0);
  const invDenom = 1 / denom;

  const a = (d10.x * s20.y - d20.x * s10.y) * invDenom;
  const b = (d10.y * s20.y - d20.y * s10.y) * invDenom;
  const c = (d20.x * s10.x - d10.x * s20.x) * invDenom;
  const d = (d20.y * s10.x - d10.y * s20.x) * invDenom;
  const e = d0.x - a * s0.x - c * s0.y;
  const f = d0.y - b * s0.x - d * s0.y;
  return { a, b, c, d, e, f };
}

/** Draw one texture-mapped triangle by clipping and applying an affine transform. */
export function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  s0: Vec2,
  s1: Vec2,
  s2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2,
  alpha: number
) {
  // Clip to the triangle and draw with the affine transform.
  const m = triangleTransform(s0, s1, s2, d0, d1, d2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/** Draw one texture-mapped triangle using normalized UVs in [0,1]. */
export function drawTexturedTriangleUv(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  uv0: Vec2,
  uv1: Vec2,
  uv2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2,
  alpha: number
) {
  // Convert UVs to pixel coordinates before drawing.
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const imageSize = { x: w, y: h };
  const s0 = vec2Multiply(uv0, imageSize);
  const s1 = vec2Multiply(uv1, imageSize);
  const s2 = vec2Multiply(uv2, imageSize);
  drawTexturedTriangle(ctx, img, s0, s1, s2, d0, d1, d2, alpha);
}

/** Draw a solid/stroked quad for flat faces. */
export function drawQuad(
  ctx: CanvasRenderingContext2D,
  points: Vec2[],
  fill: string | CanvasPattern,
  stroke: string,
  alpha = 1
) {
  // Simple quad fill/stroke for flat faces.
  if (points.length !== 4) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

/** Draw a textured quad by splitting into two textured triangles and stroking outline. */
export function drawTexturedQuad(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  points: Vec2[],
  uv: Vec2[] | undefined,
  stroke: string,
  alpha = 1
) {
  // Split quad into two triangles for texture mapping.
  if (points.length !== 4) return;
  const uv0 = uv?.[0] ?? { x: 0, y: 0 };
  const uv1 = uv?.[1] ?? { x: 1, y: 0 };
  const uv2 = uv?.[2] ?? { x: 1, y: 1 };
  const uv3 = uv?.[3] ?? { x: 0, y: 1 };
  drawTexturedTriangleUv(ctx, img, uv0, uv1, uv2, points[0], points[1], points[2], alpha);
  drawTexturedTriangleUv(ctx, img, uv0, uv2, uv3, points[0], points[2], points[3], alpha);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}
