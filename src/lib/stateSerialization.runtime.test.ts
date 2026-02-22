import { describe, expect, it, vi } from "vitest";
import type { CanvasObjectType } from "../types";
import {
  createRuntimeTemplateResolver,
  parseStateWithRuntimeTemplates,
  serializeStateWithRuntimeTemplates,
  type RuntimeTemplateLookup,
} from "./stateSerialization.runtime";
import type { SavedState } from "./stateSerialization";

function makeLookup(overrides: Partial<RuntimeTemplateLookup> = {}): RuntimeTemplateLookup {
  return {
    hasKnownTemplateDimensions: () => false,
    getTemplateImage: () => null,
    getTemplateShape: () => undefined,
    getTemplateWdh: () => undefined,
    ...overrides,
  };
}

describe("stateSerialization.runtime", () => {
  it("builds resolver functions from an injected template lookup", () => {
    const lookup = makeLookup({
      hasKnownTemplateDimensions: vi.fn(() => true),
      getTemplateImage: vi.fn(() => "images/fake.png"),
      getTemplateShape: vi.fn(() => ({ type: "wah" })),
      getTemplateWdh: vi.fn(() => [10, 20, 30] as [number, number, number]),
    });
    const resolver = createRuntimeTemplateResolver(lookup);

    expect(resolver.hasKnownTemplateDimensions("t-1")).toBe(true);
    expect(resolver.getTemplateImage("t-1")).toBe("images/fake.png");
    expect(resolver.getTemplateShape("t-1")).toEqual({ type: "wah" });
    expect(resolver.getTemplateWdh("t-1")).toEqual([10, 20, 30]);
    expect(lookup.hasKnownTemplateDimensions).toHaveBeenCalledWith("t-1");
    expect(lookup.getTemplateImage).toHaveBeenCalledWith("t-1");
    expect(lookup.getTemplateShape).toHaveBeenCalledWith("t-1");
    expect(lookup.getTemplateWdh).toHaveBeenCalledWith("t-1");
  });

  it("parses using an injected resolver instead of default runtime lookup", () => {
    const resolver = createRuntimeTemplateResolver(
      makeLookup({
        hasKnownTemplateDimensions: () => true,
        getTemplateImage: () => "images/injected.png",
        getTemplateShape: () => ({ type: "wedge", ratio: 0.8 }),
        getTemplateWdh: () => [111, 222, 333] as [number, number, number],
      })
    );

    const raw = JSON.stringify({
      objects: [
        {
          id: "obj-1",
          templateId: "template-injected",
          subtype: "device",
          type: "pedal",
          brand: "Brand",
          model: "Model",
          pos: { x: 5, y: 10 },
        },
      ],
    });

    const parsed = parseStateWithRuntimeTemplates(raw, resolver);
    expect(parsed).not.toBeNull();
    expect(parsed!.objects[0].width).toBe(111);
    expect(parsed!.objects[0].depth).toBe(222);
    expect(parsed!.objects[0].height).toBe(333);
    expect(parsed!.objects[0].image).toBe("images/injected.png");
    expect(parsed!.objects[0].shape).toEqual({ type: "wedge", ratio: 0.8 });
  });

  it("serializes using injected known-template rules", () => {
    const resolver = createRuntimeTemplateResolver(
      makeLookup({
        hasKnownTemplateDimensions: (templateId?: string) => templateId === "known-template",
      })
    );
    const state: SavedState = {
      objects: [
        {
          id: "obj-1",
          templateId: "known-template",
          subtype: "device",
          type: "pedal",
          brand: "Brand",
          model: "Model",
          name: "Brand Model",
          pos: { x: 1.25, y: 2.5 },
          width: 70,
          depth: 120,
          height: 55,
          image: null,
        } satisfies CanvasObjectType,
      ],
    };

    const serialized = serializeStateWithRuntimeTemplates(state, resolver);
    const object = (serialized.objects as Array<Record<string, unknown>>)[0];
    // Known template dimensions should be omitted from persisted payload.
    expect(object).not.toHaveProperty("width");
    expect(object).not.toHaveProperty("depth");
    expect(object).not.toHaveProperty("height");
    // Non-custom template object names are also stripped by strategy.
    expect(object).not.toHaveProperty("name");
  });
});
