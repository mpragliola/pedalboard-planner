import { createContext, useContext, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { Cable } from "../types";

export interface CableContextValue {
  cables: Cable[];
  setCables: (action: Cable[] | ((prev: Cable[]) => Cable[]), saveToHistory?: boolean) => void;
  /** Add a cable to board state. Persistence is handled by the persistence layer. */
  addCable: (cable: Cable) => void;
  selectedCableId: string | null;
  setSelectedCableId: (action: string | null | ((prev: string | null) => string | null)) => void;
  onCablePointerDown: (id: string, e: ReactPointerEvent) => void;
}

const CableContext = createContext<CableContextValue | null>(null);

export function CableProvider({ value, children }: { value: CableContextValue; children: ReactNode }) {
  return <CableContext.Provider value={value}>{children}</CableContext.Provider>;
}

export function useCable(): CableContextValue {
  const ctx = useContext(CableContext);
  if (!ctx) throw new Error("useCable must be used within CableProvider");
  return ctx;
}
