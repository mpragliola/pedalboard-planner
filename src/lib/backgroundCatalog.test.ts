import { describe, expect, it } from "vitest";
import {
  CANVAS_BACKGROUNDS,
  DEFAULT_CANVAS_BACKGROUND,
  isCanvasBackgroundId,
} from "./backgroundCatalog";

describe("CANVAS_BACKGROUNDS", () => {
  it("contains at least one background", () => {
    expect(CANVAS_BACKGROUNDS.length).toBeGreaterThan(0);
  });

  it("every background has a non-empty id, label, imageUrl, and previewImageUrl", () => {
    for (const bg of CANVAS_BACKGROUNDS) {
      expect(bg.id.length).toBeGreaterThan(0);
      expect(bg.label.length).toBeGreaterThan(0);
      expect(bg.imageUrl.length).toBeGreaterThan(0);
      expect(bg.previewImageUrl.length).toBeGreaterThan(0);
    }
  });

  it("all background IDs are unique", () => {
    const ids = CANVAS_BACKGROUNDS.map((bg) => bg.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("contains the default background", () => {
    const ids = CANVAS_BACKGROUNDS.map((bg) => bg.id);
    expect(ids).toContain(DEFAULT_CANVAS_BACKGROUND);
  });

  it("pro backgrounds have a mini3d property", () => {
    const proBgs = CANVAS_BACKGROUNDS.filter((bg) => bg.id.startsWith("pro-"));
    expect(proBgs.length).toBeGreaterThan(0);
    for (const bg of proBgs) {
      expect(bg).toHaveProperty("mini3d");
      expect((bg as typeof bg & { mini3d?: unknown }).mini3d).toBeDefined();
    }
  });

  it("non-pro backgrounds do not have a mini3d property", () => {
    const regularBgs = CANVAS_BACKGROUNDS.filter((bg) => !bg.id.startsWith("pro-"));
    for (const bg of regularBgs) {
      expect((bg as typeof bg & { mini3d?: unknown }).mini3d).toBeUndefined();
    }
  });

  it("pro backgrounds have roughnessMapUrl and displacementMapUrl in mini3d", () => {
    const proBgs = CANVAS_BACKGROUNDS.filter((bg) => (bg as { mini3d?: unknown }).mini3d);
    for (const bg of proBgs) {
      const mini3d = (bg as { mini3d: { roughnessMapUrl: string; displacementMapUrl: string } }).mini3d;
      expect(mini3d.roughnessMapUrl.length).toBeGreaterThan(0);
      expect(mini3d.displacementMapUrl.length).toBeGreaterThan(0);
    }
  });
});

describe("DEFAULT_CANVAS_BACKGROUND", () => {
  it("is 'floorboards'", () => {
    expect(DEFAULT_CANVAS_BACKGROUND).toBe("floorboards");
  });
});

describe("isCanvasBackgroundId", () => {
  it("returns true for every known background id", () => {
    for (const bg of CANVAS_BACKGROUNDS) {
      expect(isCanvasBackgroundId(bg.id)).toBe(true);
    }
  });

  it("returns false for unknown string values", () => {
    expect(isCanvasBackgroundId("not-a-real-bg")).toBe(false);
    expect(isCanvasBackgroundId("")).toBe(false);
    expect(isCanvasBackgroundId("FLOORBOARDS")).toBe(false); // case-sensitive
  });

  it("returns false for non-string types", () => {
    expect(isCanvasBackgroundId(null)).toBe(false);
    expect(isCanvasBackgroundId(undefined)).toBe(false);
    expect(isCanvasBackgroundId(42)).toBe(false);
    expect(isCanvasBackgroundId({})).toBe(false);
    expect(isCanvasBackgroundId([])).toBe(false);
    expect(isCanvasBackgroundId(true)).toBe(false);
  });

  it("returns true for 'floorboards'", () => {
    expect(isCanvasBackgroundId("floorboards")).toBe(true);
  });
});
