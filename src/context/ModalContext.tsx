import { createContext, type RefObject } from "react";

/**
 * Ref to the current modal's <dialog> element. When present, overlays (e.g. dropdowns)
 * should portal into this dialog so they appear in the top layer above the modal content.
 */
export const ModalContext = createContext<RefObject<HTMLDialogElement | null> | null>(null);
