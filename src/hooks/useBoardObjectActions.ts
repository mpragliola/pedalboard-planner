import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { HistoryCommand } from "./useHistory";
import {
  createBringObjectToFrontCommand,
  createDeleteObjectCommand,
  createRotateObjectCommand,
  createSendObjectToBackCommand,
} from "../context/boardStateCommands";
import type { BoardState } from "../context/useBoardPersistence";

interface UseBoardObjectActionsOptions {
  executeBoardCommand: (command: HistoryCommand<BoardState>) => void;
  setSelectedObjectIds: Dispatch<SetStateAction<string[]>>;
}

export function useBoardObjectActions({ executeBoardCommand, setSelectedObjectIds }: UseBoardObjectActionsOptions) {
  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((id: string) => {
    setImageFailedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleDeleteObject = useCallback(
    (id: string) => {
      // Delete is command-backed so undo can restore object + z-order without full snapshots.
      // Selection cleanup remains a UI concern and is intentionally outside command state.
      executeBoardCommand(createDeleteObjectCommand(id));
      setSelectedObjectIds((prev) => prev.filter((sid) => sid !== id));
    },
    [executeBoardCommand, setSelectedObjectIds]
  );

  const handleRotateObject = useCallback(
    (id: string) => {
      executeBoardCommand(createRotateObjectCommand(id));
    },
    [executeBoardCommand]
  );

  const handleSendToBack = useCallback(
    (id: string) => {
      executeBoardCommand(createSendObjectToBackCommand(id));
    },
    [executeBoardCommand]
  );

  const handleBringToFront = useCallback(
    (id: string) => {
      executeBoardCommand(createBringObjectToFrontCommand(id));
    },
    [executeBoardCommand]
  );

  return {
    imageFailedIds,
    handleImageError,
    handleDeleteObject,
    handleRotateObject,
    handleSendToBack,
    handleBringToFront,
  };
}
