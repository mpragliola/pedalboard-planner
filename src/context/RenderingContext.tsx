import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const MINI3D_LOW_RESOURCE_MODE_STORAGE_KEY = "mini3d-mobile-safe-mode-v1";

export type CablesVisibility = "shown" | "dim" | "hidden";

export interface RenderingContextValue {
  showMini3d: boolean;
  setShowMini3d: Dispatch<SetStateAction<boolean>>;
  showMini3dFloor: boolean;
  setShowMini3dFloor: Dispatch<SetStateAction<boolean>>;
  showMini3dShadows: boolean;
  setShowMini3dShadows: Dispatch<SetStateAction<boolean>>;
  showMini3dSurfaceDetail: boolean;
  setShowMini3dSurfaceDetail: Dispatch<SetStateAction<boolean>>;
  showMini3dSpecular: boolean;
  setShowMini3dSpecular: Dispatch<SetStateAction<boolean>>;
  mini3dLowResourceMode: boolean;
  setMini3dLowResourceMode: Dispatch<SetStateAction<boolean>>;
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

export function usePersistentMini3dLowResourceMode(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [mini3dLowResourceMode, setMini3dLowResourceMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(MINI3D_LOW_RESOURCE_MODE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (mini3dLowResourceMode) {
        window.localStorage.setItem(MINI3D_LOW_RESOURCE_MODE_STORAGE_KEY, "1");
      } else {
        window.localStorage.removeItem(MINI3D_LOW_RESOURCE_MODE_STORAGE_KEY);
      }
    } catch {
      /* Ignore storage failures. */
    }
  }, [mini3dLowResourceMode]);

  return [mini3dLowResourceMode, setMini3dLowResourceMode];
}
