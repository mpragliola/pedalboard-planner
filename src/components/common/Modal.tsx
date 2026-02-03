import { useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Additional class for the dialog element */
  className?: string;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** aria-label for the dialog */
  ariaLabel?: string;
}

/**
 * Reusable modal component using the native <dialog> element.
 * Benefits:
 * - Native focus trapping
 * - Native backdrop click handling
 * - Proper accessibility (role, aria-modal handled by browser)
 * - Escape key handling built-in
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
  showCloseButton = true,
  ariaLabel,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle backdrop click (click outside content)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Handle native close event (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const modal = (
    <dialog
      ref={dialogRef}
      className={`modal-dialog ${className}`}
      aria-label={ariaLabel ?? title}
      onClick={handleBackdropClick}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <header className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            )}
          </header>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );

  return createPortal(modal, document.body);
}
