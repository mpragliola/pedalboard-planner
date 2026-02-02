import { describe, it, expect } from "vitest";
import { formatLength } from "./rulerFormat";

describe("formatLength", () => {
  it("formats mm with one decimal when >= 0.1", () => {
    expect(formatLength(100, "mm")).toBe("100.0 mm");
    expect(formatLength(0.5, "mm")).toBe("0.5 mm");
  });

  it("formats mm with two decimals when < 0.1", () => {
    expect(formatLength(0.05, "mm")).toBe("0.05 mm");
  });

  it("formats inches with two decimals when >= 0.01 in", () => {
    expect(formatLength(25.4, "in")).toBe("1.00 in");
    expect(formatLength(254, "in")).toBe("10.00 in");
  });

  it("formats inches in mil when very small", () => {
    const s = formatLength(0.1, "in");
    expect(s).toMatch(/mil$/);
  });

  it("formats zero", () => {
    expect(formatLength(0, "mm")).toBe("0.00 mm");
    expect(formatLength(0, "in")).toMatch(/in|mil/);
  });
});
