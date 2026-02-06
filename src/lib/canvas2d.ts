import type { Vec2 } from "./vector";

// 2D canvas drawing helpers for textured and flat faces.
export type Mat2D = { a: number; b: number; c: number; d: number; e: number; f: number };

export function triangleTransform(
  s0: Vec2,
  s1: Vec2,
  s2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2
): Mat2D {
  // Solve the affine transform that maps source triangle to destination triangle.
  const denom = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(denom) < 1e-6) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denom;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denom;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denom;
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denom;
  const e =
    (d0.x * (s1.x * s2.y - s2.x * s1.y) +
      d1.x * (s2.x * s0.y - s0.x * s2.y) +
      d2.x * (s0.x * s1.y - s1.x * s0.y)) /
    denom;
  const f =
    (d0.y * (s1.x * s2.y - s2.x * s1.y) +
      d1.y * (s2.x * s0.y - s0.x * s2.y) +
      d2.y * (s0.x * s1.y - s1.x * s0.y)) /
    denom;
  return { a, b, c, d, e, f };
}

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
  const s0 = { x: uv0.x * w, y: uv0.y * h };
  const s1 = { x: uv1.x * w, y: uv1.y * h };
  const s2 = { x: uv2.x * w, y: uv2.y * h };
  drawTexturedTriangle(ctx, img, s0, s1, s2, d0, d1, d2, alpha);
}

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
