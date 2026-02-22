import { describe, expect, it } from "vitest";
import { computeToolbarPosition } from "./toolbarPosition";

describe("computeToolbarPosition", () => {
  it("places toolbar above bounds when there is enough top space", () => {
    const position = computeToolbarPosition(
      { x: 120, y: 200 },
      { minY: 180, maxY: 220 },
      { gapPx: 8, toolbarHeightPx: 36 }
    );
    expect(position).toEqual({ left: 120, top: 136 });
  });

  it("flips toolbar below bounds when above placement would clip near top", () => {
    const position = computeToolbarPosition(
      { x: 120, y: 20 },
      { minY: 10, maxY: 30 },
      { gapPx: 8, toolbarHeightPx: 36 }
    );
    expect(position).toEqual({ left: 120, top: 38 });
  });

  it("uses anchor as fallback bounds when no explicit bounds are provided", () => {
    const position = computeToolbarPosition(
      { x: 80, y: 60 },
      null,
      { gapPx: 8, toolbarHeightPx: 36 }
    );
    expect(position).toEqual({ left: 80, top: 68 });
  });
});

