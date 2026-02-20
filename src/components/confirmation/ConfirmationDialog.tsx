import { useDialogControl } from "../../hooks/useDialogControl";
import "./ConfirmationDialog.scss";

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const { dialogRef, handleBackdropClick } = useDialogControl(open, onCancel);

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
      onClick={handleBackdropClick}
    >
      <div className="confirmation-content" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirmation-title" className="confirmation-title">
          {title}
        </h2>
        <p id="confirmation-message" className="confirmation-message">
          {message}
        </p>
        <div className="confirmation-actions">
          <button type="button" className="confirmation-btn confirmation-cancel" onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirmation-btn confirmation-confirm ${danger ? "confirmation-danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
