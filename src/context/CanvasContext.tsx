import {
  createContext,
  useContext,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

export interface CanvasContextValue {
  canvasRef: RefObject<HTMLDivElement>;
  zoom: number;
  pan: { x: number; y: number };
  tileSize: number;
  isPanning: boolean;
  spaceDown: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
  canvasAnimating: boolean;
  setCanvasAnimating: (v: boolean) => void;
  handleCanvasPointerDown: (e: ReactPointerEvent) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ value, children }: { value: CanvasContextValue; children: ReactNode }) {
  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
}
