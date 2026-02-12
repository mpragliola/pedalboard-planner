import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { CanvasBackgroundId } from "../constants/backgrounds";

export interface UiContextValue {
  showGrid: boolean;
  setShowGrid: Dispatch<SetStateAction<boolean>>;
  xray: boolean;
  setXray: Dispatch<SetStateAction<boolean>>;
  showMini3d: boolean;
  setShowMini3d: Dispatch<SetStateAction<boolean>>;
  ruler: boolean;
  setRuler: Dispatch<SetStateAction<boolean>>;
  lineRuler: boolean;
  setLineRuler: Dispatch<SetStateAction<boolean>>;
  cableLayer: boolean;
  setCableLayer: Dispatch<SetStateAction<boolean>>;
  cablesVisibility: "shown" | "dim" | "hidden";
  setCablesVisibility: Dispatch<SetStateAction<"shown" | "dim" | "hidden">>;
  floatingUiVisible: boolean;
  setFloatingUiVisible: Dispatch<SetStateAction<boolean>>;
  panelExpanded: boolean;
  setPanelExpanded: Dispatch<SetStateAction<boolean>>;
  unit: "mm" | "in";
  setUnit: Dispatch<SetStateAction<"mm" | "in">>;
  background: CanvasBackgroundId;
  setBackground: Dispatch<SetStateAction<CanvasBackgroundId>>;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ value, children }: { value: UiContextValue; children: ReactNode }) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
