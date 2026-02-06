import { describe, expect, it, vi } from "vitest";
import {
  drawQuad,
  drawTexturedQuad,
  drawTexturedTriangle,
  drawTexturedTriangleUv,
  triangleTransform,
  type Mat2D,
} from "./canvas2d";
import type { Vec2 } from "./vector";

type Mock2DContextState = {
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  clip: ReturnType<typeof vi.fn>;
  transform: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  fillStyle: string | CanvasPattern;
  strokeStyle: string | CanvasPattern;
  globalAlpha: number;
};

function createMockContext(): { ctx: CanvasRenderingContext2D; state: Mock2DContextState } {
  const state: Mock2DContextState = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    transform: vi.fn(),
    drawImage: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
  };
  return { ctx: state as unknown as CanvasRenderingContext2D, state };
}

function createMockImage({
  naturalWidth = 0,
  naturalHeight = 0,
  width = 0,
  height = 0,
}: {
  naturalWidth?: number;
  naturalHeight?: number;
  width?: number;
  height?: number;
} = {}): HTMLImageElement {
  return { naturalWidth, naturalHeight, width, height } as HTMLImageElement;
}

function applyMat(m: Mat2D, p: Vec2): Vec2 {
  return {
    x: m.a * p.x + m.c * p.y + m.e,
    y: m.b * p.x + m.d * p.y + m.f,
  };
}

function expectVec2Close(actual: Vec2, expected: Vec2): void {
  expect(actual.x).toBeCloseTo(expected.x, 8);
  expect(actual.y).toBeCloseTo(expected.y, 8);
}

describe("canvas2d helpers", () => {
  it("returns identity transform for degenerate source triangle", () => {
    const m = triangleTransform(
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 5, y: 10 },
      { x: 8, y: 10 },
      { x: 5, y: 12 }
    );
    expect(m).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
  });

  it("maps source triangle vertices onto destination vertices", () => {
    const s0 = { x: 0, y: 0 };
    const s1 = { x: 2, y: 0 };
    const s2 = { x: 0, y: 3 };
    const d0 = { x: 10, y: 20 };
    const d1 = { x: 25, y: 24 };
    const d2 = { x: 8, y: 40 };
    const m = triangleTransform(s0, s1, s2, d0, d1, d2);

    expectVec2Close(applyMat(m, s0), d0);
    expectVec2Close(applyMat(m, s1), d1);
    expectVec2Close(applyMat(m, s2), d2);
  });

  it("drawTexturedTriangle clips, transforms, and draws image", () => {
    const { ctx, state } = createMockContext();
    const img = createMockImage();
    const s0 = { x: 0, y: 0 };
    const s1 = { x: 2, y: 0 };
    const s2 = { x: 0, y: 2 };
    const d0 = { x: 10, y: 20 };
    const d1 = { x: 20, y: 22 };
    const d2 = { x: 8, y: 32 };
    const m = triangleTransform(s0, s1, s2, d0, d1, d2);

    drawTexturedTriangle(ctx, img, s0, s1, s2, d0, d1, d2, 0.4);

    expect(state.save).toHaveBeenCalledOnce();
    expect(state.beginPath).toHaveBeenCalledOnce();
    expect(state.moveTo).toHaveBeenCalledWith(d0.x, d0.y);
    expect(state.lineTo).toHaveBeenNthCalledWith(1, d1.x, d1.y);
    expect(state.lineTo).toHaveBeenNthCalledWith(2, d2.x, d2.y);
    expect(state.closePath).toHaveBeenCalledOnce();
    expect(state.clip).toHaveBeenCalledOnce();
    expect(state.transform).toHaveBeenCalledWith(m.a, m.b, m.c, m.d, m.e, m.f);
    expect(state.drawImage).toHaveBeenCalledWith(img, 0, 0);
    expect(state.restore).toHaveBeenCalledOnce();
    expect(state.globalAlpha).toBe(0.4);
  });

  it("drawTexturedTriangleUv converts UV coordinates using image width/height fallback", () => {
    const { ctx, state } = createMockContext();
    const img = createMockImage({ width: 300, height: 150 });

    drawTexturedTriangleUv(
      ctx,
      img,
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 0, y: 150 },
      1
    );

    expect(state.transform).toHaveBeenCalledOnce();
    const [a, b, c, d, e, f] = state.transform.mock.calls[0] as number[];
    expect(a).toBeCloseTo(1, 8);
    expect(b).toBeCloseTo(0, 8);
    expect(c).toBeCloseTo(0, 8);
    expect(d).toBeCloseTo(1, 8);
    expect(e).toBeCloseTo(0, 8);
    expect(f).toBeCloseTo(0, 8);
  });

  it("drawQuad draws fill and stroke for 4 points only", () => {
    const points: Vec2[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const { ctx, state } = createMockContext();
    drawQuad(ctx, points, "#f00", "#000", 0.7);

    expect(state.save).toHaveBeenCalledOnce();
    expect(state.fill).toHaveBeenCalledOnce();
    expect(state.stroke).toHaveBeenCalledOnce();
    expect(state.fillStyle).toBe("#f00");
    expect(state.strokeStyle).toBe("#000");
    expect(state.globalAlpha).toBe(1);

    const short = createMockContext();
    drawQuad(short.ctx, points.slice(0, 3), "#f00", "#000");
    expect(short.state.save).not.toHaveBeenCalled();
    expect(short.state.fill).not.toHaveBeenCalled();
    expect(short.state.stroke).not.toHaveBeenCalled();
  });

  it("drawTexturedQuad renders two textured triangles and an outline", () => {
    const points: Vec2[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const { ctx, state } = createMockContext();
    const img = createMockImage({ width: 100, height: 100 });
    drawTexturedQuad(ctx, img, points, undefined, "#111", 0.9);

    expect(state.drawImage).toHaveBeenCalledTimes(2);
    expect(state.transform).toHaveBeenCalledTimes(2);
    expect(state.stroke).toHaveBeenCalledOnce();
    expect(state.strokeStyle).toBe("#111");

    const short = createMockContext();
    drawTexturedQuad(short.ctx, img, points.slice(0, 3), undefined, "#111");
    expect(short.state.drawImage).not.toHaveBeenCalled();
    expect(short.state.stroke).not.toHaveBeenCalled();
  });
});
