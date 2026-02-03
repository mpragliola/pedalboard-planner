import { describe, it, expect } from "vitest";
import type { Wdh } from "./wdh";

describe("Wdh type", () => {
  it("accepts [number, number, number] tuple", () => {
    const wdh: Wdh = [100, 200, 50];
    expect(wdh).toHaveLength(3);
    expect(wdh[0]).toBe(100);
    expect(wdh[1]).toBe(200);
    expect(wdh[2]).toBe(50);
  });
});
