import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type CablesVisibility = "shown" | "dim" | "hidden";

/** Overlay toggle state: rulers, cable draw layer, cables visibility.
 *  3D view settings live in Mini3dContext to avoid re-rendering overlay consumers on 3D changes. */
export interface RenderingContextValue {
  ruler: boolean;
  setRuler: Dispatch<SetStateAction<boolean>>;
  lineRuler: boolean;
  setLineRuler: Dispatch<SetStateAction<boolean>>;
  cableLayer: boolean;
  setCableLayer: Dispatch<SetStateAction<boolean>>;
  cablesVisibility: CablesVisibility;
  setCablesVisibility: Dispatch<SetStateAction<CablesVisibility>>;
}

const RenderingContext = createContext<RenderingContextValue | null>(null);

export function RenderingProvider({ value, children }: { value: RenderingContextValue; children: ReactNode }) {
  return <RenderingContext.Provider value={value}>{children}</RenderingContext.Provider>;
}

export function useRendering(): RenderingContextValue {
  const ctx = useContext(RenderingContext);
  if (!ctx) throw new Error("useRendering must be used within RenderingProvider");
  return ctx;
}
