import { describe, expect, it } from "vitest";
import { normalizeRotation } from "./geometry";

describe("geometry helpers", () => {
  it("normalizes rotations to 0-359", () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-90)).toBe(270);
  });
});
