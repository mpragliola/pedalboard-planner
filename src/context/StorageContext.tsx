import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { DEBOUNCE_SAVE_MS } from "../constants";
import { StateManager } from "../lib/stateManager";
import { parseState, serializeState, type SavedState } from "../lib/stateSerialization";

interface StorageContextValue {
  savedState: SavedState | null;
  loadStateFromFile: (file: File) => Promise<SavedState>;
  saveStateToFile: (state: SavedState) => void;
  persistState: (state: SavedState, opts?: { immediate?: boolean }) => void;
}

const StorageContext = createContext<StorageContextValue | null>(null);

const stateManager = new StateManager("pedal/state");

export function StorageProvider({ children }: { children: ReactNode }) {
  const [savedState] = useState<SavedState | null>(() => stateManager.load());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStateFromFile = useCallback(async (file: File): Promise<SavedState> => {
    let text = "";
    try {
      text = await file.text();
    } catch {
      throw new Error("Could not read the selected file.");
    }
    const state = parseState(text);
    if (!state) {
      throw new Error("The selected file is not a valid pedalboard JSON file.");
    }
    return state;
  }, []);

  const saveStateToFile = useCallback((state: SavedState) => {
    const payload = serializeState(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedalboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const persistState = useCallback(
    (state: SavedState, opts?: { immediate?: boolean }) => {
      if (opts?.immediate) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        stateManager.save(state);
        return;
      }
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        stateManager.save(state);
      }, DEBOUNCE_SAVE_MS);
    },
    []
  );

  return (
    <StorageContext.Provider value={{ savedState, loadStateFromFile, saveStateToFile, persistState }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): StorageContextValue {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within StorageProvider");
  return ctx;
}

