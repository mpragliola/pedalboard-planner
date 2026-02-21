import { createContext, useContext, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react";
import type { CatalogFilters } from "../types/catalogFilters";

export type CatalogMode = "boards" | "devices";

export interface CatalogContextValue {
  dropdownPanelRef: RefObject<HTMLDivElement>;
  catalogMode: CatalogMode;
  setCatalogMode: Dispatch<SetStateAction<CatalogMode>>;
  filters: CatalogFilters;
  onBoardSelect: (templateId: string) => void;
  onDeviceSelect: (templateId: string) => void;
  /** Place a catalog item on the canvas (used by @dnd-kit onDragEnd). */
  placeFromCatalog: (
    clientX: number,
    clientY: number,
    data: { mode: CatalogMode; templateId: string }
  ) => void;
  /** Returns true if the last interaction was a catalog drop (so click handlers should not close panel). */
  shouldIgnoreCatalogClick: () => boolean;
  onCustomBoardCreate: (params: { widthMm: number; depthMm: number; color: string; name: string }) => void;
  onCustomDeviceCreate: (params: { widthMm: number; depthMm: number; color: string; name: string }) => void;
  onCustomCreate: (
    mode: CatalogMode,
    params: { widthMm: number; depthMm: number; color: string; name: string }
  ) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ value, children }: { value: CatalogContextValue; children: ReactNode }) {
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
