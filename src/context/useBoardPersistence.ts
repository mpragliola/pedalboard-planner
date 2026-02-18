import { useCallback, useEffect, useMemo, useRef } from "react";
import { DEFAULT_CANVAS_BACKGROUND, type CanvasBackgroundId } from "../constants/backgrounds";
import { initNextObjectIdFromObjects } from "../lib/templateHelpers";
import type { SavedState } from "../lib/stateSerialization";
import type { Offset } from "../lib/vector";
import type { CanvasObjectType, Cable } from "../types";

export interface BoardState {
  /** Objects currently present on the board canvas. */
  objects: CanvasObjectType[];
  /** Cables currently present on the board canvas. */
  cables: Cable[];
}

interface UseBoardPersistenceOptions {
  objects: CanvasObjectType[];
  cables: Cable[];
  historyPast: BoardState[];
  historyFuture: BoardState[];
  zoom: number;
  pan: Offset;
  showGrid: boolean;
  unit: "mm" | "in";
  background: CanvasBackgroundId;
  initialObjects: CanvasObjectType[];
  replaceHistoryRaw: (present: BoardState, past: BoardState[], future: BoardState[]) => void;
  setZoom: (value: number) => void;
  setPan: (value: Offset) => void;
  setShowGrid: (value: boolean) => void;
  setUnit: (value: "mm" | "in") => void;
  setBackground: (value: CanvasBackgroundId) => void;
  clearSelection: () => void;
  loadStateFromFile: (file: File) => Promise<SavedState>;
  saveStateToFile: (state: SavedState) => void;
  persistState: (state: SavedState, opts?: { immediate?: boolean }) => void;
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
 * Handles board IO lifecycle: loading state into history/UI, exporting state,
 * and persisting working state (debounced + immediate-on-cables).
 */
export function useBoardPersistence({
  objects,
  cables,
  historyPast,
  historyFuture,
  zoom,
  pan,
  showGrid,
  unit,
  background,
  initialObjects,
  replaceHistoryRaw,
  setZoom,
  setPan,
  setShowGrid,
  setUnit,
  setBackground,
  clearSelection,
  loadStateFromFile,
  saveStateToFile,
  persistState,
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

  // Apply loaded state to history + UI controls in a single coordinated transition.
  const loadBoardState = useCallback(
    (state: SavedState) => {
      if (state.objects?.length) initNextObjectIdFromObjects(state.objects);
      const loadedCables = state.cables ?? [];
      replaceHistoryRaw(
        { objects: state.objects ?? initialObjects, cables: loadedCables },
        (state.past ?? []).map((snapshot) => ({ objects: snapshot, cables: loadedCables })),
        (state.future ?? []).map((snapshot) => ({ objects: snapshot, cables: loadedCables }))
      );
      clearSelection();
      setUnit(state.unit ?? "mm");
      setBackground(state.background ?? DEFAULT_CANVAS_BACKGROUND);
      setShowGrid(state.showGrid ?? false);
      if (typeof state.zoom === "number") setZoom(state.zoom);
      if (state.pan && typeof state.pan.x === "number" && typeof state.pan.y === "number") {
        setPan(state.pan);
      }
    },
    [replaceHistoryRaw, initialObjects, clearSelection, setUnit, setBackground, setShowGrid, setZoom, setPan]
  );

  const newBoard = useCallback(() => {
    replaceHistoryRaw({ objects: initialObjects, cables: [] }, [], []);
    clearSelection();
    setUnit("mm");
    setBackground(DEFAULT_CANVAS_BACKGROUND);
    setShowGrid(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [replaceHistoryRaw, initialObjects, clearSelection, setUnit, setBackground, setShowGrid, setZoom, setPan]);

  const loadBoardFromFile = useCallback(
    async (file: File): Promise<void> => {
      const state = await loadStateFromFile(file);
      loadBoardState(state);
    },
    [loadStateFromFile, loadBoardState]
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
