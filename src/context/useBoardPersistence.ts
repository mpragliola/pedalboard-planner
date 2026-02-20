import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CanvasBackgroundId } from "../constants/backgrounds";
import type { SavedState } from "../lib/stateSerialization";
import type { Offset } from "../lib/vector";
import type { CanvasObjectType, Cable } from "../types";

export interface BoardState {
  /** Objects currently present on the board canvas. */
  objects: CanvasObjectType[];
  /** Cables currently present on the board canvas. */
  cables: Cable[];
}

interface BoardPersistenceSnapshot {
  objects: CanvasObjectType[];
  cables: Cable[];
  historyPast: BoardState[];
  historyFuture: BoardState[];
  zoom: number;
  pan: Offset;
  showGrid: boolean;
  unit: "mm" | "in";
  background: CanvasBackgroundId;
}

interface BoardPersistenceStorage {
  loadStateFromFile: (file: File) => Promise<SavedState>;
  saveStateToFile: (state: SavedState) => void;
  persistState: (state: SavedState, opts?: { immediate?: boolean }) => void;
}

interface BoardPersistenceActions {
  resetBoardState: () => void;
  applyLoadedState: (state: SavedState) => void;
}

interface UseBoardPersistenceOptions {
  snapshot: BoardPersistenceSnapshot;
  storage: BoardPersistenceStorage;
  actions: BoardPersistenceActions;
}

interface UseBoardPersistenceResult {
  /** Reset board + view/UI state to defaults. */
  newBoard: () => void;
  /** Import and apply state from a user-selected JSON file. */
  loadBoardFromFile: (file: File) => Promise<void>;
  /** Export the current board state to a JSON file. */
  saveBoardToFile: () => void;
}

/**
 * Handles board IO lifecycle: load/save file operations plus local persistence.
 * App-specific transitions (history/UI/selection updates) are delegated to callers.
 */
export function useBoardPersistence({
  snapshot: { objects, cables, historyPast, historyFuture, zoom, pan, showGrid, unit, background },
  storage: { loadStateFromFile, saveStateToFile, persistState },
  actions: { resetBoardState, applyLoadedState },
}: UseBoardPersistenceOptions): UseBoardPersistenceResult {
  // Persist only object snapshots in history payloads (matches existing save format).
  const pastForSave = useMemo(() => historyPast.map((entry) => entry.objects), [historyPast]);
  const futureForSave = useMemo(() => historyFuture.map((entry) => entry.objects), [historyFuture]);

  // Canonical persisted payload built from live editor state.
  const persistedState = useMemo<SavedState>(
    () => ({
      objects,
      past: pastForSave,
      future: futureForSave,
      zoom,
      pan,
      showGrid,
      unit,
      background,
      cables,
    }),
    [objects, pastForSave, futureForSave, zoom, pan, showGrid, unit, background, cables]
  );
  const persistedStateRef = useRef<SavedState>(persistedState);
  // Keep a ref to avoid effect dependency expansion for "immediate on cables" saves.
  useEffect(() => {
    persistedStateRef.current = persistedState;
  }, [persistedState]);

  const newBoard = useCallback(() => {
    resetBoardState();
  }, [resetBoardState]);

  const loadBoardFromFile = useCallback(
    async (file: File): Promise<void> => {
      const state = await loadStateFromFile(file);
      applyLoadedState(state);
    },
    [loadStateFromFile, applyLoadedState]
  );

  const saveBoardToFile = useCallback(() => {
    saveStateToFile({ objects, zoom, pan, showGrid, unit, background, cables });
  }, [objects, zoom, pan, showGrid, unit, background, cables, saveStateToFile]);

  // Default persistence path: debounced writes.
  useEffect(() => {
    persistState(persistedState);
  }, [persistedState, persistState]);

  // Force immediate persistence when cables change (explicit product requirement).
  useEffect(() => {
    persistState(persistedStateRef.current, { immediate: true });
  }, [cables, persistState]);

  return {
    newBoard,
    loadBoardFromFile,
    saveBoardToFile,
  };
}
