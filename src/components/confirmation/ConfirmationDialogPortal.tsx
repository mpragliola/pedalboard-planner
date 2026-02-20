import { createPortal } from "react-dom";
import { useConfirmationDialogState } from "../../context/ConfirmationContext";
import { ConfirmationDialog } from "./ConfirmationDialog";

export function ConfirmationDialogPortal() {
  const { pending, handleConfirm, handleCancel } = useConfirmationDialogState();

  if (!pending) return null;

  return createPortal(
    <ConfirmationDialog
      open
      title={pending.title}
      message={pending.message}
      confirmLabel={pending.confirmLabel}
      cancelLabel={pending.cancelLabel}
      danger={pending.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />,
    document.body
  );
}
