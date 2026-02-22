import { describe, expect, it, vi } from "vitest";
import type { CanvasObjectType } from "../../types";
import { GROUND_Y, MIN_ORBIT_DISTANCE } from "./mini3dConstants";
import { buildSceneLayout, type SceneLayoutTemplateLookup } from "./sceneLayout";

function makeObject(overrides: Partial<CanvasObjectType> = {}): CanvasObjectType {
  return {
    id: "obj-1",
    templateId: "device-template",
    subtype: "device",
    type: "pedal",
    brand: "Brand",
    model: "Model",
    name: "Name",
    pos: { x: 0, y: 0 },
    width: 100,
    depth: 60,
    height: 40,
    rotation: 0,
    color: "#111111",
    image: null,
    ...overrides,
  };
}

function makeLookup(overrides: Partial<SceneLayoutTemplateLookup> = {}): SceneLayoutTemplateLookup {
  return {
    getObjectDimensions: () => [100, 60, 40],
    getTemplateShape: () => ({ type: "box" }),
    ...overrides,
  };
}

describe("buildSceneLayout", () => {
  it("returns the empty-scene fallback when no renderable objects exist", () => {
    const getObjectDimensions: SceneLayoutTemplateLookup["getObjectDimensions"] = vi.fn(() => [0, 0, 0]);
    const getTemplateShape: SceneLayoutTemplateLookup["getTemplateShape"] = vi.fn(() => undefined);
    const layout = buildSceneLayout([], { getObjectDimensions, getTemplateShape });

    expect(layout).toEqual({
      boxes: [],
      orbitDistance: MIN_ORBIT_DISTANCE,
      targetY: GROUND_Y + 1,
    });
    expect(getObjectDimensions).not.toHaveBeenCalled();
    expect(getTemplateShape).not.toHaveBeenCalled();
  });

  it("uses injected template lookups to resolve dimensions and fallback shape", () => {
    const obj = makeObject({ shape: undefined, templateId: "template-1" });
    const getObjectDimensions: SceneLayoutTemplateLookup["getObjectDimensions"] = vi.fn(() => [120, 40, 30]);
    const getTemplateShape: SceneLayoutTemplateLookup["getTemplateShape"] = vi.fn(() => ({ type: "wedge", ratio: 0.6 }));
    const layout = buildSceneLayout([obj], { getObjectDimensions, getTemplateShape });

    expect(getObjectDimensions).toHaveBeenCalledWith(obj);
    expect(getTemplateShape).toHaveBeenCalledWith("template-1");
    expect(layout.boxes).toHaveLength(1);
    expect(layout.boxes[0].width).toBeGreaterThan(0);
    expect(layout.boxes[0].shape).toEqual({ type: "wedge", ratio: 0.6 });
  });

  it("prefers explicit object shape over template lookup", () => {
    const obj = makeObject({ shape: { type: "wah" }, templateId: "template-2" });
    const getTemplateShape: SceneLayoutTemplateLookup["getTemplateShape"] = vi.fn(() => ({ type: "box" }));
    const layout = buildSceneLayout([obj], makeLookup({ getTemplateShape }));

    expect(getTemplateShape).not.toHaveBeenCalled();
    expect(layout.boxes[0].shape).toEqual({ type: "wah" });
  });
});
