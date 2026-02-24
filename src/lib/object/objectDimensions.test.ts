import { describe, expect, it } from "vitest";
import {
  getTemplateImage,
  getTemplateShape,
  getTemplateWdh,
  hasKnownTemplateDimensions,
} from "./objectDimensions";

describe("objectDimensions", () => {
  it("returns mapped image paths for known templates", () => {
    expect(getTemplateImage("device-boss-ds-1")).toBe("images/devices/boss/boss-ds1.png");
    expect(getTemplateImage("board-aclam-xs2")).toBe("images/boards/aclam/aclam-smart-track-xs2.png");
  });

  it("returns null for unknown or missing template images", () => {
    expect(getTemplateImage("device-unknown-test")).toBe(null);
    expect(getTemplateImage(undefined)).toBe(null);
  });

  it("returns dimensions and known-template checks for mapped templates", () => {
    const wdh = getTemplateWdh("device-boss-ds-1");
    expect(wdh).toEqual([73, 129, 59]);
    expect(hasKnownTemplateDimensions("device-boss-ds-1")).toBe(true);
    expect(hasKnownTemplateDimensions("device-unknown-test")).toBe(false);
    expect(hasKnownTemplateDimensions(undefined)).toBe(false);
  });

  it("returns shapes only for templates that define them", () => {
    expect(getTemplateShape("device-boss-ds-1")).toEqual({ type: "pedal-boss-type", ratio: 0.45 });
    expect(getTemplateShape("board-aclam-xs2")).toBeUndefined();
    expect(getTemplateShape(undefined)).toBeUndefined();
  });
});
