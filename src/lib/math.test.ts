import { describe, expect, it } from "vitest";
import { clamp, easeOutCubic } from "./math";

describe("math helpers", () => {
  it("clamps numbers into an inclusive range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("computes cubic ease-out values", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 8);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("is monotonic on common sample points", () => {
    const samples = [0, 0.25, 0.5, 0.75, 1].map(easeOutCubic);
    expect(samples[0]).toBeLessThanOrEqual(samples[1]);
    expect(samples[1]).toBeLessThanOrEqual(samples[2]);
    expect(samples[2]).toBeLessThanOrEqual(samples[3]);
    expect(samples[3]).toBeLessThanOrEqual(samples[4]);
  });
});
