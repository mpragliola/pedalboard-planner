interface CableFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Footer action row for add/edit modal. */
export function CableFormActions({ isEdit, onCancel, onConfirm }: CableFormActionsProps) {
  return (
    <div className="add-cable-actions">
      <button type="button" className="add-cable-btn add-cable-cancel" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" className="add-cable-btn add-cable-confirm" onClick={onConfirm}>
        {isEdit ? "Save" : "Add cable"}
      </button>
    </div>
  );
}
