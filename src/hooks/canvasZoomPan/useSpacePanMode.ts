import { useEffect } from "react";
import { isEditableTarget } from "./utils";

interface UseSpacePanModeOptions {
  isPanning: boolean;
  setSpaceDown: (value: boolean) => void;
  stopPanning: () => void;
}

export function useSpacePanMode({ isPanning, setSpaceDown, stopPanning }: UseSpacePanModeOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      setSpaceDown(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      setSpaceDown(false);
      if (isPanning) stopPanning();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPanning, setSpaceDown, stopPanning]);
}
