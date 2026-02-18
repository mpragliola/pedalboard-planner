import { describe, expect, it } from "vitest";
import { parseState, serializeState, type SavedState } from "./stateSerialization";

const objectWithoutTemplateDims = {
  id: "obj-1",
  templateId: "device-boss-ds-1",
  subtype: "device",
  type: "pedal",
  brand: "Boss",
  model: "DS-1",
  pos: { x: 10.1234, y: 20.6789 },
};

describe("stateSerialization (pure codec)", () => {
  it("requires explicit dimensions when no template resolver is provided", () => {
    expect(parseState(JSON.stringify({ objects: [objectWithoutTemplateDims] }))).toBeNull();
  });

  it("parses explicit dimensions without runtime enrichment", () => {
    const parsed = parseState(
      JSON.stringify({
        objects: [{ ...objectWithoutTemplateDims, width: 73, depth: 129, height: 58 }],
      })
    ) as SavedState;

    expect(parsed.objects[0]).toMatchObject({
      width: 73,
      depth: 129,
      height: 58,
      image: null,
    });
  });

  it("serializes coordinates and pan/zoom rounding without resolver", () => {
    const state: SavedState = {
      objects: [
        {
          id: "obj-2",
          subtype: "board",
          type: "classic",
          brand: "Custom",
          model: "Board",
          templateId: "board-custom",
          pos: { x: 1.239, y: -9.991 },
          width: 500,
          depth: 300,
          height: 30,
          image: null,
          name: "My Board",
        },
      ],
      pan: { x: 100.555, y: 200.444 },
      zoom: 1.236,
    };

    const serialized = serializeState(state);
    expect(serialized.pan).toEqual({ x: 100.56, y: 200.44 });
    expect(serialized.zoom).toBe(1.24);
    expect((serialized.objects as Record<string, unknown>[])[0].pos).toEqual({ x: 1.24, y: -9.99 });
  });
});
