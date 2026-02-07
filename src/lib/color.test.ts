import { describe, expect, it } from "vitest";
import { clampChannel, parseColor, rgba, shade } from "./color";

describe("color helpers", () => {
  it("clamps channel values into [0, 255] and rounds", () => {
    expect(clampChannel(-10)).toBe(0);
    expect(clampChannel(12.49)).toBe(12);
    expect(clampChannel(12.5)).toBe(13);
    expect(clampChannel(300)).toBe(255);
  });

  it("parses short and full hex colors", () => {
    expect(parseColor("#0f8")).toEqual({ r: 0, g: 255, b: 136 });
    expect(parseColor("  #12AbEf  ")).toEqual({ r: 18, g: 171, b: 239 });
  });

  it("parses rgb()/rgba() strings", () => {
    expect(parseColor("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColor("rgba(1,2,3,0.5)")).toEqual({ r: 1, g: 2, b: 3 });
  });

  it("returns null for unsupported formats", () => {
    expect(parseColor("#12")).toBeNull();
    expect(parseColor("#12345")).toBeNull();
    expect(parseColor("hsl(120, 50%, 50%)")).toBeNull();
    expect(parseColor("not-a-color")).toBeNull();
  });

  it("applies brightness shading with channel clamp", () => {
    expect(shade({ r: 10, g: 20, b: 30 }, 1.5)).toEqual({ r: 15, g: 30, b: 45 });
    expect(shade({ r: 200, g: 220, b: 240 }, 2)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("formats rgba CSS string", () => {
    expect(rgba({ r: 7, g: 8, b: 9 }, 0.35)).toBe("rgba(7, 8, 9, 0.35)");
  });
});
