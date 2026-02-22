import { useEffect, useRef } from "react";

interface UseCableLayerKeyboardOptions {
  isModalOpen: boolean;
  hasDrawing: boolean;
  clearDrawing: () => void;
  exitMode: () => void;
  openAddCableModal: () => void;
}

/**
 * Keyboard orchestration for cable draw mode.
 *
 * Extracted from `CableLayerOverlay` so key behavior is isolated and testable:
 * - `Escape`: clear in-progress cable when present, otherwise exit mode
 * - `Enter`: open Add Cable modal when a drawable path exists
 */
export function useCableLayerKeyboard({
  isModalOpen,
  hasDrawing,
  clearDrawing,
  exitMode,
  openAddCableModal,
}: UseCableLayerKeyboardOptions) {
  // Ref keeps key handler aligned with the latest draw state without re-binding
  // listeners on every `hasDrawing` transition.
  const hasDrawingRef = useRef(hasDrawing);
  hasDrawingRef.current = hasDrawing;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // While add-cable modal is open, keyboard events belong to modal controls.
      if (isModalOpen) return;

      if (e.key === "Escape") {
        if (hasDrawingRef.current) {
          e.preventDefault();
          clearDrawing();
        } else {
          exitMode();
        }
        return;
      }

      if (e.key === "Enter" && hasDrawingRef.current) {
        e.preventDefault();
        openAddCableModal();
      }
    };

    // Capture phase matches previous behavior and runs before bubbling handlers.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isModalOpen, clearDrawing, exitMode, openAddCableModal]);
}

