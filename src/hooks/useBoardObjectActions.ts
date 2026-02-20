import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { CanvasObjectType } from "../types";

interface UseBoardObjectActionsOptions {
  setObjects: (
    action: CanvasObjectType[] | ((prev: CanvasObjectType[]) => CanvasObjectType[]),
    saveToHistory?: boolean
  ) => void;
  setSelectedObjectIds: Dispatch<SetStateAction<string[]>>;
}

export function useBoardObjectActions({ setObjects, setSelectedObjectIds }: UseBoardObjectActionsOptions) {
  const [imageFailedIds, setImageFailedIds] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((id: string) => {
    setImageFailedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleDeleteObject = useCallback(
    (id: string) => {
      setObjects((prev) => prev.filter((o) => o.id !== id));
      setSelectedObjectIds((prev) => prev.filter((sid) => sid !== id));
    },
    [setObjects, setSelectedObjectIds]
  );

  const handleRotateObject = useCallback(
    (id: string) => {
      setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, rotation: ((o.rotation ?? 0) + 90) % 360 } : o)));
    },
    [setObjects]
  );

  const handleSendToBack = useCallback(
    (id: string) => {
      setObjects((prev) => {
        const i = prev.findIndex((o) => o.id === id);
        if (i <= 0) return prev;
        const obj = prev[i];
        const next = prev.slice(0, i).concat(prev.slice(i + 1));
        return [obj, ...next];
      });
    },
    [setObjects]
  );

  const handleBringToFront = useCallback(
    (id: string) => {
      setObjects((prev) => {
        const i = prev.findIndex((o) => o.id === id);
        if (i < 0 || i === prev.length - 1) return prev;
        const obj = prev[i];
        const next = prev.slice(0, i).concat(prev.slice(i + 1));
        return [...next, obj];
      });
    },
    [setObjects]
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
