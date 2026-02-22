import { useReducer, useCallback, useRef } from "react";

export interface UseHistoryOptions<T> {
  initialPast?: T[];
  initialFuture?: T[];
}

interface HistoryState<T> {
  present: T;
  past: HistoryEntry<T>[];
  future: HistoryEntry<T>[];
}

/**
 * Command object for history entries that can replay and reverse themselves
 * without requiring full-state snapshots.
 */
export interface HistoryCommand<T> {
  /** Applies the operation. Called on initial execution and on redo. */
  redo: (state: T) => T;
  /** Reverts the operation. Called on undo. */
  undo: (state: T) => T;
  /** Optional label used for debugging and future history UI. */
  label?: string;
}

type HistoryEntry<T> =
  | { kind: "snapshot"; state: T }
  | { kind: "command"; command: HistoryCommand<T> };

type HistoryAction<T> =
  | { type: "SET"; payload: T; saveToHistory: boolean }
  | { type: "EXECUTE_COMMAND"; command: HistoryCommand<T> }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "REPLACE"; present: T; past: T[]; future: T[] };

function toSnapshotEntries<T>(states: T[]): HistoryEntry<T>[] {
  return states.map((state) => ({ kind: "snapshot", state }));
}

function entriesToSnapshotStates<T>(entries: HistoryEntry<T>[]): T[] {
  // Snapshot arrays are kept for compatibility with persistence/inspection paths.
  // Command-backed entries are intentionally omitted to avoid storing full states.
  return entries.flatMap((entry) => (entry.kind === "snapshot" ? [entry.state] : []));
}

function createHistoryReducer<T>(depth: number) {
  return function historyReducer(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
    switch (action.type) {
      case "SET": {
        if (action.payload === state.present) return state;
        if (action.saveToHistory) {
          return {
            present: action.payload,
            past: [...state.past, { kind: "snapshot", state: state.present }].slice(-depth),
            future: [],
          };
        }
        return { ...state, present: action.payload };
      }
      case "EXECUTE_COMMAND": {
        const next = action.command.redo(state.present);
        if (next === state.present) return state;
        return {
          present: next,
          past: [...state.past, { kind: "command", command: action.command }].slice(-depth),
          future: [],
        };
      }
      case "UNDO": {
        if (state.past.length === 0) return state;
        const entry = state.past[state.past.length - 1];
        const previous = entry.kind === "command" ? entry.command.undo(state.present) : entry.state;
        const futureEntry: HistoryEntry<T> =
          entry.kind === "command" ? entry : { kind: "snapshot", state: state.present };
        return {
          present: previous,
          past: state.past.slice(0, -1),
          future: [futureEntry, ...state.future],
        };
      }
      case "REDO": {
        if (state.future.length === 0) return state;
        const entry = state.future[0];
        const next = entry.kind === "command" ? entry.command.redo(state.present) : entry.state;
        const pastEntry: HistoryEntry<T> =
          entry.kind === "command" ? entry : { kind: "snapshot", state: state.present };
        return {
          present: next,
          past: [...state.past, pastEntry],
          future: state.future.slice(1),
        };
      }
      case "REPLACE": {
        return {
          present: action.present,
          past: toSnapshotEntries(action.past),
          future: toSnapshotEntries(action.future),
        };
      }
      default:
        return state;
    }
  };
}

export function useHistory<T>(initialState: T, depth = 200, options?: UseHistoryOptions<T>) {
  const [historyState, dispatch] = useReducer(createHistoryReducer<T>(depth), {
    present: initialState,
    past: toSnapshotEntries(options?.initialPast ?? []),
    future: toSnapshotEntries(options?.initialFuture ?? []),
  });

  // Keep ref in sync for function-based setState calls
  const presentRef = useRef(historyState.present);
  presentRef.current = historyState.present;

  const setState = useCallback((action: T | ((prev: T) => T), saveToHistory = true) => {
    const newValue = typeof action === "function" ? (action as (prev: T) => T)(presentRef.current) : action;
    dispatch({ type: "SET", payload: newValue, saveToHistory });
  }, []);

  const executeCommand = useCallback((command: HistoryCommand<T>) => {
    dispatch({ type: "EXECUTE_COMMAND", command });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const replace = useCallback((newState: T, newPast: T[] = [], newFuture: T[] = []) => {
    dispatch({ type: "REPLACE", present: newState, past: newPast, future: newFuture });
  }, []);

  return {
    state: historyState.present,
    setState,
    executeCommand,
    replace,
    undo,
    redo,
    canUndo: historyState.past.length > 0,
    canRedo: historyState.future.length > 0,
    past: entriesToSnapshotStates(historyState.past),
    future: entriesToSnapshotStates(historyState.future),
  };
}
