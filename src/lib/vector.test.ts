import { describe, expect, it } from "vitest";
import {
  vec2Add,
  vec2Cross,
  vec2Multiply,
  vec2Rotate,
  vec2Scale,
  vec2Sub,
  vec3Add,
  vec3Average,
  vec3Cross,
  vec3Dot,
  vec3Length,
  vec3Normalize,
  vec3Sub,
} from "./vector";

describe("vector helpers", () => {
  it("supports basic vec2 operations", () => {
    expect(vec2Add({ x: 1, y: 2 }, { x: 3, y: -4 })).toEqual({ x: 4, y: -2 });
    expect(vec2Sub({ x: 10, y: 5 }, { x: 3, y: 8 })).toEqual({ x: 7, y: -3 });
    expect(vec2Scale({ x: -2, y: 6 }, 0.5)).toEqual({ x: -1, y: 3 });
    expect(vec2Multiply({ x: 2, y: -3 }, { x: 4, y: 0.5 })).toEqual({ x: 8, y: -1.5 });
    expect(vec2Cross({ x: 3, y: 0 }, { x: 0, y: 2 })).toBe(6);
  });

  it("rotates vec2 coordinates", () => {
    const rotated = vec2Rotate({ x: 1, y: 0 }, Math.PI / 2);
    expect(rotated.x).toBeCloseTo(0, 8);
    expect(rotated.y).toBeCloseTo(1, 8);
  });

  it("supports basic vec3 operations", () => {
    expect(vec3Add({ x: 1, y: 2, z: 3 }, { x: 4, y: -2, z: 1 })).toEqual({ x: 5, y: 0, z: 4 });
    expect(vec3Sub({ x: 1, y: 2, z: 3 }, { x: 4, y: -2, z: 1 })).toEqual({ x: -3, y: 4, z: 2 });
    expect(vec3Dot({ x: 1, y: 2, z: 3 }, { x: 4, y: -2, z: 1 })).toBe(3);
    expect(vec3Cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqual({ x: 0, y: 0, z: 1 });
  });

  it("computes vec3 length, normalize, and average", () => {
    expect(vec3Length({ x: 3, y: 4, z: 12 })).toBe(13);
    expect(vec3Normalize({ x: 0, y: 0, z: 0 })).toEqual({ x: 0, y: 0, z: 0 });
    const normalized = vec3Normalize({ x: 3, y: 0, z: 4 });
    expect(normalized.x).toBeCloseTo(0.6, 8);
    expect(normalized.z).toBeCloseTo(0.8, 8);
    expect(
      vec3Average([
        { x: 0, y: 0, z: 0 },
        { x: 6, y: 3, z: 9 },
      ])
    ).toEqual({ x: 3, y: 1.5, z: 4.5 });
  });
});
