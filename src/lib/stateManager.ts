/** Persistence helpers for editor state (storage only). */
import type { SavedState } from "./stateSerialization";
import {
  parseStateWithRuntimeTemplates,
  serializeStateWithRuntimeTemplates,
} from "./stateSerialization.runtime";

interface StateCodec {
  parse: (json: string) => SavedState | null;
  serialize: (state: SavedState) => Record<string, unknown>;
}

const DEFAULT_STATE_CODEC: StateCodec = {
  parse: parseStateWithRuntimeTemplates,
  serialize: serializeStateWithRuntimeTemplates,
};

/**
 * Loads and saves app state to a storage backend (e.g. localStorage).
 * Parsing/serialization live in stateSerialization.
 */
export class StateManager {
  constructor(
    private readonly storageKey: string = "pedal/state",
    // Allow tests/alternative runtimes to inject a custom parse/serialize policy.
    private readonly codec: StateCodec = DEFAULT_STATE_CODEC
  ) {}

  /** 
   * Loads and parses state from storage. Returns null if no state or invalid state. 
   */
  load(): SavedState | null {
    try {
      const raw = typeof localStorage !== "undefined"
        ? localStorage.getItem(this.storageKey)
        : null;
      if (!raw) return null;
      const parsed = this.codec.parse(raw);
      if (parsed) return parsed;
      // If persisted data is no longer compatible with the schema, wipe it.
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(this.storageKey);
      }
      return null;
    } catch {
      return null;
    }
  }

  /** 
   * Serializes and saves state to storage. Fails silently if quota 
   * exceeded or storage unavailable. 
   */
  save(state: SavedState): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.codec.serialize(state))
        );
      }
    } catch {
      // quota or disabled
    }
  }
}
