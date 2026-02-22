import { describe, expect, it } from "vitest";
import type { Cable, CanvasObjectType } from "../types";
import type { BoardState } from "./useBoardPersistence";
import {
  createDeleteCableCommand,
  createRotateObjectCommand,
  createUpsertCableCommand,
} from "./boardStateCommands";

function makeObject(id: string, rotation?: number): CanvasObjectType {
  return {
    id,
    subtype: "device",
    type: "effect",
    brand: "B",
    model: "M",
    name: "N",
    pos: { x: 0, y: 0 },
    width: 10,
    depth: 10,
    height: 10,
    rotation,
    image: null,
  };
}

function makeCable(id: string, color = "#000000"): Cable {
  return {
    id,
    color,
    segments: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
    connectorA: "mono jack (TS)",
    connectorB: "mono jack (TS)",
  };
}

describe("boardStateCommands", () => {
  it("rotate-object command rotates on redo and restores previous rotation on undo", () => {
    const command = createRotateObjectCommand("o1");
    const initial: BoardState = {
      objects: [makeObject("o1", 270)],
      cables: [],
    };

    const rotated = command.redo(initial);
    expect(rotated.objects[0].rotation).toBe(0);

    const restored = command.undo(rotated);
    expect(restored.objects[0].rotation).toBe(270);
  });

  it("delete-cable command removes and restores cable at original index", () => {
    const command = createDeleteCableCommand("c2");
    const initial: BoardState = {
      objects: [],
      cables: [makeCable("c1"), makeCable("c2"), makeCable("c3")],
    };

    const afterDelete = command.redo(initial);
    expect(afterDelete.cables.map((cable) => cable.id)).toEqual(["c1", "c3"]);

    const restored = command.undo(afterDelete);
    expect(restored.cables.map((cable) => cable.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("upsert-cable command updates existing cable and restores previous value on undo", () => {
    const initialCable = makeCable("c1", "#111111");
    const updatedCable = makeCable("c1", "#FFFFFF");
    const command = createUpsertCableCommand(updatedCable);
    const initial: BoardState = {
      objects: [],
      cables: [initialCable],
    };

    const afterUpdate = command.redo(initial);
    expect(afterUpdate.cables[0].color).toBe("#FFFFFF");

    const restored = command.undo(afterUpdate);
    expect(restored.cables[0].color).toBe("#111111");
  });
});
