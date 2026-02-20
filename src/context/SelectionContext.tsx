import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Selection =
  | { kind: "object"; id: string }
  | { kind: "cable"; id: string }
  | null;

export interface SelectionContextValue {
  selection: Selection;
  setSelection: (action: Selection | ((prev: Selection) => Selection)) => void;
  selectedObjectIds: string[];
  setSelectedObjectIds: (action: string[] | ((prev: string[]) => string[])) => void;
  selectedCableId: string | null;
  setSelectedCableId: (action: string | null | ((prev: string | null) => string | null)) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection>(null);

  const selectedObjectIds = selection?.kind === "object" ? [selection.id] : [];
  const selectedCableId = selection?.kind === "cable" ? selection.id : null;

  const setSelectedObjectIds = useCallback(
    (action: string[] | ((prev: string[]) => string[])) => {
      setSelection((prev) => {
        const prevIds = prev?.kind === "object" ? [prev.id] : [];
        const nextIds = typeof action === "function" ? action(prevIds) : action;
        const nextId = nextIds[0] ?? null;
        return nextId ? { kind: "object", id: nextId } : null;
      });
    },
    []
  );

  const setSelectedCableId = useCallback(
    (action: string | null | ((prev: string | null) => string | null)) => {
      setSelection((prev) => {
        const prevId = prev?.kind === "cable" ? prev.id : null;
        const nextId = typeof action === "function" ? action(prevId) : action;
        return nextId ? { kind: "cable", id: nextId } : null;
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const value = useMemo<SelectionContextValue>(
    () => ({
      selection,
      setSelection,
      selectedObjectIds,
      setSelectedObjectIds,
      selectedCableId,
      setSelectedCableId,
      clearSelection,
    }),
    [selection, selectedObjectIds, setSelectedObjectIds, selectedCableId, setSelectedCableId, clearSelection]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
