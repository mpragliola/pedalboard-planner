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

export interface Mini3dContextValue {
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
}

const Mini3dContext = createContext<Mini3dContextValue | null>(null);

export function Mini3dProvider({ value, children }: { value: Mini3dContextValue; children: ReactNode }) {
  return <Mini3dContext.Provider value={value}>{children}</Mini3dContext.Provider>;
}

export function useMini3d(): Mini3dContextValue {
  const ctx = useContext(Mini3dContext);
  if (!ctx) throw new Error("useMini3d must be used within Mini3dProvider");
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
