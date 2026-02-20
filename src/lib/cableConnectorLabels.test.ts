import { describe, expect, it } from "vitest";
import { connectorLabelsForCable } from "./cableConnectorLabels";
import type { Cable } from "../types";

function makeCable(overrides: Partial<Cable> = {}): Cable {
  return {
    id: "cable-test",
    color: "#ff0000",
    connectorA: "ts-6.35",
    connectorB: "ts-6.35",
    segments: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
    ...overrides,
  };
}

describe("connectorLabelsForCable", () => {
  it("returns null for an empty segments array", () => {
    expect(connectorLabelsForCable(makeCable({ segments: [] }))).toBeNull();
  });

  it("returns null for a single-point cable", () => {
    expect(connectorLabelsForCable(makeCable({ segments: [{ x: 0, y: 0 }] }))).toBeNull();
  });

  it("returns null when the first segment has zero length", () => {
    expect(
      connectorLabelsForCable(makeCable({ segments: [{ x: 5, y: 5 }, { x: 5, y: 5 }] }))
    ).toBeNull();
  });

  it("returns label objects when segments are valid", () => {
    const result = connectorLabelsForCable(makeCable());
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("a");
    expect(result).toHaveProperty("b");
  });

  it("sets correct connector kind on each label", () => {
    const cable = makeCable({ connectorA: "ts-6.35", connectorB: "trs-6.35" });
    const result = connectorLabelsForCable(cable)!;
    expect(result.a.kind).toBe("ts-6.35");
    expect(result.b.kind).toBe("trs-6.35");
  });

  it("returns empty text when connectorAName / connectorBName are undefined", () => {
    const result = connectorLabelsForCable(makeCable())!;
    expect(result.a.text).toBe("");
    expect(result.b.text).toBe("");
  });

  it("returns empty text when connector names are empty strings", () => {
    const result = connectorLabelsForCable(
      makeCable({ connectorAName: "", connectorBName: "" })
    )!;
    expect(result.a.text).toBe("");
    expect(result.b.text).toBe("");
  });

  it("uses the connector names as label text", () => {
    const result = connectorLabelsForCable(
      makeCable({ connectorAName: "Output", connectorBName: "Input" })
    )!;
    expect(result.a.text).toBe("Output");
    expect(result.b.text).toBe("Input");
  });

  it("trims whitespace from connector names", () => {
    const result = connectorLabelsForCable(
      makeCable({ connectorAName: "  Guitar In  " })
    )!;
    expect(result.a.text).toBe("Guitar In");
  });

  it("falls back to anchor position when label text is empty", () => {
    const cable = makeCable({ segments: [{ x: 10, y: 20 }, { x: 110, y: 20 }] });
    const result = connectorLabelsForCable(cable)!;
    expect(result.a.labelPosition).toEqual({ x: 10, y: 20 });
    expect(result.a.iconPosition).toEqual({ x: 10, y: 20 });
    expect(result.b.labelPosition).toEqual({ x: 110, y: 20 });
    expect(result.b.iconPosition).toEqual({ x: 110, y: 20 });
  });

  it("places label A to the left of start for a rightward cable", () => {
    const cable = makeCable({
      connectorAName: "Out",
      segments: [{ x: 100, y: 0 }, { x: 200, y: 0 }],
    });
    const result = connectorLabelsForCable(cable)!;
    // For a cable going right (+x), label A faces left: x < anchor x (100)
    expect(result.a.labelPosition.x).toBeLessThan(100);
  });

  it("places label B to the right of end for a rightward cable", () => {
    const cable = makeCable({
      connectorBName: "In",
      segments: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
    });
    const result = connectorLabelsForCable(cable)!;
    expect(result.b.labelPosition.x).toBeGreaterThan(100);
  });

  it("places label A above start for a downward cable", () => {
    const cable = makeCable({
      connectorAName: "Out",
      segments: [{ x: 0, y: 100 }, { x: 0, y: 200 }],
    });
    const result = connectorLabelsForCable(cable)!;
    // Cable goes down (+y), so label A faces up: y < anchor y (100)
    expect(result.a.labelPosition.y).toBeLessThan(100);
  });

  it("uses the first segment direction for A and last segment direction for B on multi-segment cables", () => {
    const cable = makeCable({
      connectorAName: "Start",
      connectorBName: "End",
      segments: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 0 },
        { x: 150, y: 0 },
      ],
    });
    const result = connectorLabelsForCable(cable)!;
    expect(result.a.text).toBe("Start");
    expect(result.b.text).toBe("End");
    // Label B is anchored at last point (150, 0) and goes right
    expect(result.b.labelPosition.x).toBeGreaterThan(150);
  });

  it("icon position is below text position (icon rendered after text)", () => {
    const cable = makeCable({
      connectorAName: "Out",
      segments: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
    });
    const result = connectorLabelsForCable(cable)!;
    // Icon is placed below label text for a horizontal cable
    expect(result.a.iconPosition.y).toBeGreaterThan(result.a.labelPosition.y);
  });
});
