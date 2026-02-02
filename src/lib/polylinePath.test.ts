import { describe, it, expect } from "vitest";
import { buildRoundedPathD } from "./polylinePath";

describe("buildRoundedPathD", () => {
  it("returns empty string for fewer than 2 points", () => {
    expect(buildRoundedPathD([], 5)).toBe("");
    expect(buildRoundedPathD([{ x: 0, y: 0 }], 5)).toBe("");
  });

  it("returns M and L for two points", () => {
    const d = buildRoundedPathD(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      8
    );
    expect(d).toMatch(/^M 0 0/);
    expect(d).toContain("L 100 0");
  });

  it("returns path with arc for three points when radius allows", () => {
    const d = buildRoundedPathD(
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 50 },
      ],
      5
    );
    expect(d).toMatch(/^M 0 0/);
    expect(d).toMatch(/ A /);
  });

  it("uses straight line for collinear points (no arc)", () => {
    const d = buildRoundedPathD(
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
      ],
      5
    );
    expect(d).toMatch(/^M 0 0/);
    expect(d).not.toMatch(/ A /);
    expect(d).toContain("L 100 0");
  });

  it("returns path for four points", () => {
    const d = buildRoundedPathD(
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
      ],
      5
    );
    expect(d).toMatch(/^M 0 0/);
    expect(d).toContain("L 0 50");
  });
});
