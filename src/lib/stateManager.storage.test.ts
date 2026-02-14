import { beforeEach, describe, expect, it } from "vitest";
import { StateManager } from "./stateManager";

const TEST_STORAGE_KEY = "pedal/state-test";

const VALID_STATE_JSON = JSON.stringify({
  objects: [
    {
      id: "obj-1",
      templateId: "board-unknown-test",
      subtype: "board",
      type: "classic",
      brand: "Test",
      model: "Board",
      pos: { x: 10, y: 20 },
      width: 300,
      depth: 150,
      height: 25,
    },
  ],
});

describe("StateManager storage behavior", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads valid persisted state without wiping it", () => {
    localStorage.setItem(TEST_STORAGE_KEY, VALID_STATE_JSON);
    const manager = new StateManager(TEST_STORAGE_KEY);

    const loaded = manager.load();

    expect(loaded).not.toBeNull();
    expect(localStorage.getItem(TEST_STORAGE_KEY)).toBe(VALID_STATE_JSON);
  });

  it("wipes incompatible persisted state on load", () => {
    localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify({ objects: [{ id: "bad" }] }));
    const manager = new StateManager(TEST_STORAGE_KEY);

    const loaded = manager.load();

    expect(loaded).toBeNull();
    expect(localStorage.getItem(TEST_STORAGE_KEY)).toBeNull();
  });
});
