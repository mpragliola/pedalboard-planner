import { describe, it, expect } from "vitest";
import { PromptBuilder } from "./promptBuilder";
import type { CanvasObjectType, Cable } from "../types";

const baseObject = (overrides: Partial<CanvasObjectType> & { id: string; name: string }): CanvasObjectType =>
  ({
    subtype: "device",
    type: "pedal",
    brand: "",
    model: "",
    pos: { x: 0, y: 0 },
    width: 70,
    depth: 120,
    height: 50,
    image: null,
    ...overrides,
  } as CanvasObjectType);

const defaultOptions = {
  includeMaterials: false,
  includeCommentsAndTips: false,
  location: "",
  cables: [] as Cable[],
  unit: "mm" as const,
  getObjectName: (id: string) => id,
};

describe("PromptBuilder", () => {
  describe("getComponentsList", () => {
    it("returns placeholder when no objects", () => {
      const pb = new PromptBuilder([], defaultOptions);
      expect(pb.getComponentsList()).toBe("(no components on canvas)");
    });

    it("returns bullet list with name only when no brand/model", () => {
      const pb = new PromptBuilder([baseObject({ id: "d1", name: "My Pedal" })], defaultOptions);
      expect(pb.getComponentsList()).toBe("- My Pedal");
    });

    it("includes brand and model in parentheses when present", () => {
      const pb = new PromptBuilder(
        [
          baseObject({
            id: "d1",
            name: "DC-2w",
            brand: "Boss",
            model: "DC-2w",
          }),
        ],
        defaultOptions
      );
      expect(pb.getComponentsList()).toContain("Boss DC-2w");
      expect(pb.getComponentsList()).toContain("- DC-2w");
    });
  });

  describe("getCableList", () => {
    it("returns empty string when no cables", () => {
      const pb = new PromptBuilder([], defaultOptions);
      expect(pb.getCableList()).toBe("");
    });

    it("formats cable with connectors and length in mm (no hex color)", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        unit: "mm",
        cables: [
          {
            id: "cab1",
            segments: [
              { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } },
              { start: { x: 100, y: 0 }, end: { x: 100, y: 50 } },
            ],
            color: "#333",
            connectorA: "mono jack (TS)",
            connectorB: "mono jack (TS)",
          },
        ],
        getObjectName: (id: string) => id,
      });
      const list = pb.getCableList();
      expect(list).not.toContain("#333");
      expect(list).toContain("Cable:");
      expect(list).toContain("mono jack (TS)");
      expect(list).toContain("at least 150 mm");
    });

    it("formats cable length in inches when unit is in", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        unit: "in",
        cables: [
          {
            id: "cab1",
            segments: [{ start: { x: 0, y: 0 }, end: { x: 254, y: 0 } }],
            color: "#000",
            connectorA: "stereo jack (TRS)",
            connectorB: "stereo jack (TRS)",
          },
        ],
        getObjectName: (id: string) => id,
      });
      const list = pb.getCableList();
      expect(list).toContain("at least 10.00 in");
    });
  });

  describe("build", () => {
    it("includes components and price estimate intro", () => {
      const pb = new PromptBuilder([baseObject({ id: "d1", name: "Test" })], defaultOptions);
      const out = pb.build();
      expect(out).toContain("Components:");
      expect(out).toContain("- Test");
      expect(out).toContain("estimate the total price");
    });

    it("includes materials when includeMaterials is true", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        includeMaterials: true,
        getObjectName: (id) => id,
      });
      const out = pb.build();
      expect(out).toContain("cables, velcro");
    });

    it("includes cable layer list when includeMaterials is true and cables exist", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        includeMaterials: true,
        cables: [
          {
            id: "cab1",
            segments: [{ start: { x: 0, y: 0 }, end: { x: 200, y: 0 } }],
            color: "#333",
            connectorA: "mono jack (TS)",
            connectorB: "mono jack (TS)",
          },
        ],
        getObjectName: (id) => id,
      });
      const out = pb.build();
      expect(out).toContain("Cables (drawn on cable layer):");
      expect(out).toContain("at least 200 mm");
      expect(out).not.toContain("#333");
    });

    it("excludes materials when includeMaterials is false", () => {
      const pb = new PromptBuilder([], defaultOptions);
      const out = pb.build();
      expect(out).toContain("Exclude");
      expect(out).toContain("cables");
    });

    it("includes location when provided", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        location: "Berlin, Germany",
      });
      const out = pb.build();
      expect(out).toContain("Berlin, Germany");
    });

    it("includes comments/tips when includeCommentsAndTips is true", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        includeCommentsAndTips: true,
      });
      const out = pb.build();
      expect(out).toContain("Comment on the configuration");
      expect(out).toContain("suggestions");
    });

    it("asks for estimate only when includeCommentsAndTips is false", () => {
      const pb = new PromptBuilder([], defaultOptions);
      const out = pb.build();
      expect(out).toContain("only provide the price estimate");
    });
  });
});
