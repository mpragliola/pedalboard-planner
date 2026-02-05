import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";

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
  cablesVisible: boolean;
  setCablesVisible: Dispatch<SetStateAction<boolean>>;
  floatingUiVisible: boolean;
  setFloatingUiVisible: Dispatch<SetStateAction<boolean>>;
  panelExpanded: boolean;
  setPanelExpanded: Dispatch<SetStateAction<boolean>>;
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
