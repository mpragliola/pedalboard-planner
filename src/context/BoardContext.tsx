import {
  createContext,
  useContext,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { CanvasObjectType } from "../types";

type ObjectsUpdateAction = CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]);

export interface BoardContextValue {
  objects: CanvasObjectType[];
  /** @deprecated Prefer `setObjectsWithHistory` / `setObjectsSilent` for explicit intent. */
  setObjects: (
    action: ObjectsUpdateAction,
    saveToHistory?: boolean
  ) => void;
  /** Applies update and records it in undo/redo history. */
  setObjectsWithHistory: (action: ObjectsUpdateAction) => void;
  /** Applies update without creating a history snapshot. */
  setObjectsSilent: (action: ObjectsUpdateAction) => void;
  imageFailedIds: Set<string>;
  draggingObjectId: string | null;
  onImageError: (id: string) => void;
  onObjectPointerDown: (id: string, e: ReactPointerEvent) => void;
  onDragEnd: () => void;
  onDeleteObject: (id: string) => void;
  onRotateObject: (id: string) => void;
  onSendToBack: (id: string) => void;
  onBringToFront: (id: string) => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ value, children }: { value: BoardContextValue; children: ReactNode }) {
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}
