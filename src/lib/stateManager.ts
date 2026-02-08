/** Persistence helpers for editor state (storage only). */
import type { SavedState } from "./stateSerialization";
import { parseState, serializeState } from "./stateSerialization";

/**
 * Loads and saves app state to a storage backend (e.g. localStorage).
 * Parsing/serialization live in stateSerialization.
 */
export class StateManager {
  constructor(private readonly storageKey: string = "pedal/state") {}

  load(): SavedState | null {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(this.storageKey) : null;
      if (!raw) return null;
      return parseState(raw);
    } catch {
      return null;
    }
  }

  save(state: SavedState): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(serializeState(state)));
      }
    } catch {
      // quota or disabled
    }
  }
}

