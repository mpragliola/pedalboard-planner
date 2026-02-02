import { describe, it, expect } from "vitest";
import { PromptBuilder } from "./promptBuilder";
import type { CanvasObjectType } from "../types";
import type { Connector } from "../types";

const baseObject = (overrides: Partial<CanvasObjectType> & { id: string; name: string }): CanvasObjectType =>
  ({
    subtype: "device",
    type: "pedal",
    brand: "",
    model: "",
    x: 0,
    y: 0,
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
  connectors: [] as Connector[],
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

  describe("getConnectorList", () => {
    it("returns empty string when no connectors", () => {
      const pb = new PromptBuilder([], defaultOptions);
      expect(pb.getConnectorList()).toBe("");
    });

    it("formats connector line with type and device names", () => {
      const getObjectName = (id: string) => (id === "d1" ? "Pedal A" : "Pedal B");
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        connectors: [
          {
            id: "c1",
            deviceA: "d1",
            deviceB: "d2",
            type: "audio",
            connectorA: "mono jack (TS)",
            connectorB: "stereo jack (TRS)",
          },
        ],
        getObjectName,
      });
      const list = pb.getConnectorList();
      expect(list).toContain("audio");
      expect(list).toContain("Pedal A");
      expect(list).toContain("Pedal B");
      expect(list).toContain("mono jack (TS)");
      expect(list).toContain("stereo jack (TRS)");
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

    it("includes materials and connector list when includeMaterials is true", () => {
      const pb = new PromptBuilder([], {
        ...defaultOptions,
        includeMaterials: true,
        connectors: [
          {
            id: "c1",
            deviceA: "d1",
            deviceB: "d2",
            type: "audio",
            connectorA: "mono jack (TS)",
            connectorB: "mono jack (TS)",
          },
        ],
        getObjectName: (id) => id,
      });
      const out = pb.build();
      expect(out).toContain("cables, velcro");
      expect(out).toContain("Connector list:");
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
