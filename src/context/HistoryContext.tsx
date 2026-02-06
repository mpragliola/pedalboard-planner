import { createContext, useContext, type ReactNode } from "react";

export interface HistoryContextValue {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ value, children }: { value: HistoryContextValue; children: ReactNode }) {
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistoryContext(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistoryContext must be used within HistoryProvider");
  return ctx;
}
