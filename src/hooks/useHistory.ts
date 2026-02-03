import { useReducer, useCallback, useRef } from "react";

export interface UseHistoryOptions<T> {
  initialPast?: T[];
  initialFuture?: T[];
}

interface HistoryState<T> {
  present: T;
  past: T[];
  future: T[];
}

type HistoryAction<T> =
  | { type: "SET"; payload: T; saveToHistory: boolean }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "REPLACE"; present: T; past: T[]; future: T[] };

function createHistoryReducer<T>(depth: number) {
  return function historyReducer(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
    switch (action.type) {
      case "SET": {
        if (action.payload === state.present) return state;
        if (action.saveToHistory) {
          return {
            present: action.payload,
            past: [...state.past, state.present].slice(-depth),
            future: [],
          };
        }
        return { ...state, present: action.payload };
      }
      case "UNDO": {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        return {
          present: previous,
          past: state.past.slice(0, -1),
          future: [state.present, ...state.future],
        };
      }
      case "REDO": {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        return {
          present: next,
          past: [...state.past, state.present],
          future: state.future.slice(1),
        };
      }
      case "REPLACE": {
        return {
          present: action.present,
          past: action.past,
          future: action.future,
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
    past: options?.initialPast ?? [],
    future: options?.initialFuture ?? [],
  });

  // Keep ref in sync for function-based setState calls
  const presentRef = useRef(historyState.present);
  presentRef.current = historyState.present;

  const setState = useCallback((action: T | ((prev: T) => T), saveToHistory = true) => {
    const newValue = typeof action === "function" ? (action as (prev: T) => T)(presentRef.current) : action;
    dispatch({ type: "SET", payload: newValue, saveToHistory });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const replace = useCallback((newState: T, newPast: T[] = [], newFuture: T[] = []) => {
    dispatch({ type: "REPLACE", present: newState, past: newPast, future: newFuture });
  }, []);

  return {
    state: historyState.present,
    setState,
    replace,
    undo,
    redo,
    canUndo: historyState.past.length > 0,
    canRedo: historyState.future.length > 0,
    past: historyState.past,
    future: historyState.future,
  };
}
