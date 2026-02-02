import { describe, it, expect } from "vitest";
import {
  createObjectFromBoardTemplate,
  createObjectFromDeviceTemplate,
  initNextObjectIdFromObjects,
  createObjectFromCustomBoard,
  createObjectFromCustomDevice,
} from "./templateHelpers";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";

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

const deviceTemplate: DeviceTemplate = {
  id: "device-boss-dc2w",
  type: "pedal",
  brand: "Boss",
  model: "DC-2w",
  name: "DC-2w",
  wdh: [73, 129, 59],
  color: "#222",
  image: "boss/dc2w.png",
};

describe("createObjectFromBoardTemplate", () => {
  it("returns object with correct shape and position", () => {
    const obj = createObjectFromBoardTemplate(boardTemplate, 50, 100);
    expect(obj.subtype).toBe("board");
    expect(obj.x).toBe(50);
    expect(obj.y).toBe(100);
    expect(obj.width).toBe(590);
    expect(obj.depth).toBe(150);
    expect(obj.height).toBe(25);
    expect(obj.id).toMatch(/^board-aclam-s1-\d+$/);
  });

  it("increments id for same template", () => {
    const a = createObjectFromBoardTemplate(boardTemplate, 0, 0);
    const b = createObjectFromBoardTemplate(boardTemplate, 0, 0);
    const numA = parseInt(a.id.split("-").pop()!, 10);
    const numB = parseInt(b.id.split("-").pop()!, 10);
    expect(numB).toBe(numA + 1);
  });
});

describe("createObjectFromDeviceTemplate", () => {
  it("returns object with correct shape and position", () => {
    const obj = createObjectFromDeviceTemplate(deviceTemplate, 200, 300);
    expect(obj.subtype).toBe("device");
    expect(obj.x).toBe(200);
    expect(obj.y).toBe(300);
    expect(obj.id).toMatch(/^device-boss-dc2w-\d+$/);
  });
});

describe("initNextObjectIdFromObjects", () => {
  it("sets counter so next id does not collide", () => {
    initNextObjectIdFromObjects([
      {
        id: "board-aclam-s1-3",
        subtype: "board",
        type: "",
        brand: "",
        model: "",
        x: 0,
        y: 0,
        width: 0,
        depth: 0,
        height: 0,
        image: null,
        name: "",
      },
    ] as never);
    const obj = createObjectFromBoardTemplate(boardTemplate, 0, 0);
    expect(obj.id).toBe("board-aclam-s1-4");
  });
});

describe("createObjectFromCustomBoard", () => {
  it("creates board with custom dimensions and name", () => {
    const obj = createObjectFromCustomBoard(
      { widthMm: 400, depthMm: 200, color: "#abc", name: "My board" },
      10,
      20
    );
    expect(obj.width).toBe(400);
    expect(obj.depth).toBe(200);
    expect(obj.name).toBe("My board");
    expect(obj.id).toMatch(/^board-custom-\d+$/);
  });

  it("uses default name when empty", () => {
    const obj = createObjectFromCustomBoard(
      { widthMm: 100, depthMm: 100, color: "#000", name: "   " },
      0,
      0
    );
    expect(obj.name).toBe("Custom board");
  });
});

describe("createObjectFromCustomDevice", () => {
  it("creates device with custom dimensions and name", () => {
    const obj = createObjectFromCustomDevice(
      { widthMm: 70, depthMm: 120, color: "#f00", name: "My pedal" },
      50,
      50
    );
    expect(obj.subtype).toBe("device");
    expect(obj.width).toBe(70);
    expect(obj.depth).toBe(120);
    expect(obj.name).toBe("My pedal");
    expect(obj.id).toMatch(/^device-custom-\d+$/);
  });

  it("uses default name when empty", () => {
    const obj = createObjectFromCustomDevice(
      { widthMm: 50, depthMm: 50, color: "#fff", name: "" },
      0,
      0
    );
    expect(obj.name).toBe("Custom device");
  });
});
