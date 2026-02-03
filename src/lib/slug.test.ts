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

  it("trims leading and trailing hyphens", () => {
    expect(modelToSlug("  DC-2w  ")).toBe("dc-2w");
  });

  it("handles empty string", () => {
    expect(modelToSlug("")).toBe("");
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

  it("handles RockBoard Duo 2.0 style model", () => {
    expect(boardId("rockboard", "Duo 2.0")).toBe("board-rockboard-duo-20");
  });

  it("handles Cinque 5.3 MAX style model", () => {
    expect(boardId("rockboard", "Cinque 5.3 MAX")).toBe("board-rockboard-cinque-53-max");
  });
});
