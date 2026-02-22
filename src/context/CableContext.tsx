import { createContext, useContext, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { Cable } from "../types";

type CablesUpdateAction = Cable[] | ((prev: Cable[]) => Cable[]);

export interface CableContextValue {
  cables: Cable[];
  /** @deprecated Prefer `setCablesWithHistory` / `setCablesSilent` for explicit intent. */
  setCables: (action: CablesUpdateAction, saveToHistory?: boolean) => void;
  /** Applies update and records it in undo/redo history. */
  setCablesWithHistory: (action: CablesUpdateAction) => void;
  /** Applies update without creating a history snapshot. */
  setCablesSilent: (action: CablesUpdateAction) => void;
  /** Add a cable to board state. Persistence is handled by the persistence layer. */
  addCable: (cable: Cable) => void;
  /** Insert or replace a cable by id with command-backed undo/redo support. */
  upsertCable: (cable: Cable) => void;
  /** Remove one cable by id with reversible command semantics. */
  deleteCable: (id: string) => void;
  /** Move cable to z-order back (first rendered). */
  sendCableToBack: (id: string) => void;
  /** Move cable to z-order front (last rendered). */
  bringCableToFront: (id: string) => void;
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
