import { describe, it, expect } from "vitest";
import { modelToSlug, deviceId, boardId } from "./slug";

describe("modelToSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(modelToSlug("Smart Track XS1")).toBe("smart-track-xs1");
  });

  it("replaces slashes with hyphens", () => {
    expect(modelToSlug("H9 / H90")).toBe("h9-h90");
  });

  it("strips non-alphanumeric except hyphens", () => {
    expect(modelToSlug("44 Magnum")).toBe("44-magnum");
    expect(modelToSlug("PitchFactor")).toBe("pitchfactor");
  });
});

describe("deviceId", () => {
  it("builds device id from brand slug and model", () => {
    expect(deviceId("eventide", "H9 / H90")).toBe("device-eventide-h9-h90");
    expect(deviceId("ehx", "44 Magnum")).toBe("device-ehx-44-magnum");
  });
});

describe("boardId", () => {
  it("builds board id from brand slug and model", () => {
    expect(boardId("aclam", "Smart Track XS1")).toBe(
      "board-aclam-smart-track-xs1"
    );
  });
});
