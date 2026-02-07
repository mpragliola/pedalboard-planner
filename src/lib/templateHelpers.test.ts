import { describe, it, expect } from "vitest";
import {
  createObjectFromTemplate,
  initNextObjectIdFromObjects,
  createObjectFromCustomBoard,
  createObjectFromCustomDevice,
} from "./templateHelpers";
import type { BoardTemplate } from "../data/boards";

const boardTemplate: BoardTemplate = {
  id: "board-aclam-s1",
  type: "classic",
  brand: "Aclam",
  model: "S1",
  name: "Smart Track S1",
  wdh: [590, 150, 25],
  color: "#333",
  image: "aclam/s1.png",
};

describe("initNextObjectIdFromObjects", () => {
  it("sets counter so next id does not collide", () => {
    // Simulate loaded objects with numeric IDs (legacy format)
    initNextObjectIdFromObjects([
      {
        id: "10",
        templateId: "board-aclam-s1",
        subtype: "board",
        type: "",
        brand: "",
        model: "",
        pos: { x: 0, y: 0 },
        width: 0,
        depth: 0,
        height: 0,
        image: null,
        name: "",
      },
    ] as never);
    const obj = createObjectFromTemplate("board", boardTemplate, { x: 0, y: 0 });
    // Counter portion of ID should be 11
    const counter = parseInt(obj.id.split("-")[1], 10);
    expect(counter).toBe(11);
  });

  it("handles new timestamp-counter format IDs", () => {
    initNextObjectIdFromObjects([
      {
        id: "1738550000000-25",
        templateId: "board-aclam-s1",
        subtype: "board",
        type: "",
        brand: "",
        model: "",
        pos: { x: 0, y: 0 },
        width: 0,
        depth: 0,
        height: 0,
        image: null,
        name: "",
      },
    ] as never);
    const obj = createObjectFromTemplate("board", boardTemplate, { x: 0, y: 0 });
    // Counter portion should be 26
    const counter = parseInt(obj.id.split("-")[1], 10);
    expect(counter).toBe(26);
  });
});

describe("createObjectFromCustomBoard", () => {
  it("creates board with custom dimensions and name", () => {
    const obj = createObjectFromCustomBoard(
      { widthMm: 400, depthMm: 200, color: "#abc", name: "My board" },
      { x: 10, y: 20 }
    );
    expect(obj.width).toBe(400);
    expect(obj.depth).toBe(200);
    expect(obj.name).toBe("My board");
    // ID is timestamp-counter format
    expect(obj.id).toMatch(/^\d+-\d+$/);
    // Custom boards have templateId "board-custom"
    expect(obj.templateId).toBe("board-custom");
  });

  it("uses default name when empty", () => {
    const obj = createObjectFromCustomBoard(
      { widthMm: 100, depthMm: 100, color: "#000", name: "   " },
      { x: 0, y: 0 }
    );
    expect(obj.name).toBe("Custom board");
  });
});

describe("createObjectFromCustomDevice", () => {
  it("creates device with custom dimensions and name", () => {
    const obj = createObjectFromCustomDevice(
      { widthMm: 70, depthMm: 120, color: "#f00", name: "My pedal" },
      { x: 50, y: 50 }
    );
    expect(obj.subtype).toBe("device");
    expect(obj.width).toBe(70);
    expect(obj.depth).toBe(120);
    expect(obj.name).toBe("My pedal");
    // ID is timestamp-counter format
    expect(obj.id).toMatch(/^\d+-\d+$/);
    // Custom devices have templateId "device-custom"
    expect(obj.templateId).toBe("device-custom");
  });

  it("uses default name when empty", () => {
    const obj = createObjectFromCustomDevice(
      { widthMm: 50, depthMm: 50, color: "#fff", name: "" },
      { x: 0, y: 0 }
    );
    expect(obj.name).toBe("Custom device");
  });
});
