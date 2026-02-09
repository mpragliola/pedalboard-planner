import { useCallback, useEffect, useRef } from "react";

interface UseDialogControlOptions {
  /** Ignore backdrop clicks for this many ms after opening. Default: 0. */
  ignoreBackdropClickForMs?: number;
}

/**
 * Manages a native <dialog> element lifecycle: open/close sync, 
 * Escape handling, and backdrop clicks.
 */
export function useDialogControl(
  open: boolean,
  onClose: () => void,
  options?: UseDialogControlOptions
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedAtRef = useRef(0);
  const ignoreMs = options?.ignoreBackdropClickForMs ?? 0;

  // Sync dialog open state with `open` prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      openedAtRef.current = Date.now();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle native close event (Escape key or dialog.close())
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target !== dialogRef.current) return;
      if (ignoreMs > 0 && Date.now() - openedAtRef.current < ignoreMs) return;
      onClose();
    },
    [onClose, ignoreMs]
  );

  return { dialogRef, handleBackdropClick };
}
