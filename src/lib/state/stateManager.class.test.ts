import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedState } from "./stateSerialization";
import { StateManager } from "./stateManager";

const STORAGE_KEY = "state-manager-test";

describe("StateManager codec injection", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("uses injected parser when loading persisted state", () => {
    localStorage.setItem(STORAGE_KEY, '{"objects":[]}');
    const parse = vi.fn(() => ({ objects: [] } as SavedState));
    const serialize = vi.fn(() => ({ objects: [] }));
    const manager = new StateManager(STORAGE_KEY, { parse, serialize });

    const loaded = manager.load();

    expect(parse).toHaveBeenCalledWith('{"objects":[]}');
    expect(loaded).toEqual({ objects: [] });
  });

  it("removes persisted payload when injected parser reports invalid state", () => {
    localStorage.setItem(STORAGE_KEY, "invalid");
    const manager = new StateManager(STORAGE_KEY, {
      parse: vi.fn(() => null),
      serialize: vi.fn(() => ({ objects: [] })),
    });

    const loaded = manager.load();

    expect(loaded).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("uses injected serializer when saving", () => {
    const parse = vi.fn(() => null);
    const serialize = vi.fn(() => ({ payload: "custom" }));
    const manager = new StateManager(STORAGE_KEY, { parse, serialize });
    const state: SavedState = { objects: [] };

    manager.save(state);

    expect(serialize).toHaveBeenCalledWith(state);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{"payload":"custom"}');
  });
});
