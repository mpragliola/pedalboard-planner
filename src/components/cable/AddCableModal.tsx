import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { CABLE_CONNECTOR_TEMPLATES } from "../../constants/cables";
import type { Cable, ConnectorKind } from "../../types";
import type { Point } from "../../lib/vector";
import { CableColorSection } from "./addCableModal/CableColorSection";
import { CableEndpointsSection } from "./addCableModal/CableEndpointsSection";
import { CableFormActions } from "./addCableModal/CableFormActions";
import {
  createInitialCableFormDraft,
  findTemplateName,
  nextCableId,
  type CableFormDraft,
} from "./addCableModal/draftState";
import "./AddCableModal.scss";

// Re-export kept for tests and any local callers that import from AddCableModal.tsx.
export { createInitialCableFormDraft } from "./addCableModal/draftState";

export interface AddCableModalProps {
  open: boolean;
  segments: Point[];
  onConfirm: (cable: Cable) => void;
  onCancel: () => void;
  /** When set, modal is in edit mode: pre-fill from cable, keep id and segments, title "Edit cable". */
  initialCable?: Cable | null;
}

/**
 * Add/edit cable modal orchestrator.
 *
 * All heavy UI blocks live in dedicated files under `addCableModal/`.
 * This file owns only state transitions and save/cancel wiring.
 */
export function AddCableModal({ open, segments, onConfirm, onCancel, initialCable }: AddCableModalProps) {
  const isEdit = Boolean(initialCable);

  // Single draft object replaces multiple parallel state setters.
  // This keeps initialization atomic and avoids "first-open" ref patterns.
  const [draft, setDraft] = useState<CableFormDraft>(() => createInitialCableFormDraft(initialCable));

  // Editing identity controls when defaults should be re-derived.
  // "new" is stable create mode identity; edit mode uses concrete cable id.
  const editingIdentity = initialCable?.id ?? "new";

  useEffect(() => {
    // Reinitialize only when modal opens or the edited cable identity changes.
    // This prevents accidental form resets while the user is typing.
    if (!open) return;
    setDraft(createInitialCableFormDraft(initialCable));
  }, [open, editingIdentity, initialCable]);

  const handleConfirm = () => {
    // Edit mode keeps original geometry; create mode consumes incoming drawn segments.
    const segs = isEdit && initialCable ? initialCable.segments : segments;
    if (segs.length < 2) return;

    const cable: Cable = {
      id: isEdit && initialCable ? initialCable.id : nextCableId(),
      segments: segs,
      color: draft.color,
      connectorA: draft.connectorA,
      connectorB: draft.connectorB,
      ...(draft.connectorAName.trim() && { connectorAName: draft.connectorAName.trim() }),
      ...(draft.connectorBName.trim() && { connectorBName: draft.connectorBName.trim() }),
    };
    onConfirm(cable);
  };

  const handleSwapConnectors = () => {
    setDraft((prev) => {
      // Swap is semantic (terminal A/B), so connector labels move with connector kinds.
      const nextConnectorA = prev.connectorB;
      const nextConnectorB = prev.connectorA;
      return {
        ...prev,
        connectorA: nextConnectorA,
        connectorB: nextConnectorB,
        connectorAName: prev.connectorBName,
        connectorBName: prev.connectorAName,
        selectedTemplateName: findTemplateName(nextConnectorA, nextConnectorB),
      };
    });
  };

  const handleConnectorAChange = (nextConnector: ConnectorKind) => {
    // Manual connector edits clear selected template because state is now custom.
    setDraft((prev) => ({ ...prev, connectorA: nextConnector, selectedTemplateName: "" }));
  };

  const handleConnectorBChange = (nextConnector: ConnectorKind) => {
    // Keep behavior symmetric with connector A.
    setDraft((prev) => ({ ...prev, connectorB: nextConnector, selectedTemplateName: "" }));
  };

  const handleTemplateChange = (templateName: string) => {
    const template = CABLE_CONNECTOR_TEMPLATES.find((item) => item.name === templateName);
    setDraft((prev) => {
      // Empty selection means "no template" and should not mutate connector kinds.
      if (!templateName || !template) return { ...prev, selectedTemplateName: templateName };

      // Template application updates both connector kinds in one atomic state write.
      return {
        ...prev,
        selectedTemplateName: templateName,
        connectorA: template.connectorA,
        connectorB: template.connectorB,
      };
    });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isEdit ? "Edit cable" : "Add cable"}
      className="add-cable-modal"
      ariaLabel={isEdit ? "Edit cable – color and connectors" : "Add cable – choose color and connectors"}
      ignoreBackdropClickForMs={200}
    >
      <div className="add-cable-form">
        <CableColorSection
          selectedColor={draft.color}
          onColorChange={(nextColor) => setDraft((prev) => ({ ...prev, color: nextColor }))}
        />
        <CableEndpointsSection
          selectedTemplateName={draft.selectedTemplateName}
          onTemplateChange={handleTemplateChange}
          onSwapConnectors={handleSwapConnectors}
          connectorA={draft.connectorA}
          onConnectorAChange={handleConnectorAChange}
          connectorAName={draft.connectorAName}
          onConnectorANameChange={(nextName) => setDraft((prev) => ({ ...prev, connectorAName: nextName }))}
          connectorB={draft.connectorB}
          onConnectorBChange={handleConnectorBChange}
          connectorBName={draft.connectorBName}
          onConnectorBNameChange={(nextName) => setDraft((prev) => ({ ...prev, connectorBName: nextName }))}
        />
        <CableFormActions isEdit={isEdit} onCancel={onCancel} onConfirm={handleConfirm} />
      </div>
    </Modal>
  );
}
