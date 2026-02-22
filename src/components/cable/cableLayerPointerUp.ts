/**
 * Pure decision helpers for CableLayerOverlay pointer-up handling.
 *
 * The goal is to keep pointer-up control flow explicit and testable:
 * 1) settle pinch state from pointer bookkeeping
 * 2) run preflight suppression rules
 * 3) route to actions-hit or canvas-up path
 */

export interface CableLayerPinchAfterPointerUpInput {
  /** Pinch flag before removing the pointer that just ended. */
  wasPinching: boolean;
  /** Active pointer count after current pointer has been removed. */
  remainingActivePointers: number;
}

export interface CableLayerPinchAfterPointerUp {
  /** True if pointer-up should leave pinch mode active. */
  isPinching: boolean;
  /** True when this pointer-up released the final active pointer. */
  lastPointerReleased: boolean;
  /** True when gesture should suppress draw commit due to completed pinch. */
  suppressBecausePinchEnded: boolean;
}

export function derivePinchAfterPointerUp({
  wasPinching,
  remainingActivePointers,
}: CableLayerPinchAfterPointerUpInput): CableLayerPinchAfterPointerUp {
  const lastPointerReleased = remainingActivePointers === 0;
  const isPinching = !lastPointerReleased && wasPinching;
  return {
    isPinching,
    lastPointerReleased,
    suppressBecausePinchEnded: lastPointerReleased && wasPinching,
  };
}

export interface CableLayerPointerUpPreflightInput {
  /** Parent modal is open; overlay must not process pointer-up actions. */
  isModalOpen: boolean;
  /** Overlay is still in pinch suppression mode. */
  isPinching: boolean;
  /** We just finished a pinch; do not emit draw segment on this pointer-up. */
  suppressBecausePinchEnded: boolean;
}

export type CableLayerPointerUpPreflightDecision = "ignore" | "ignore-after-pinch" | "process";

export function resolveCableLayerPointerUpPreflight({
  isModalOpen,
  isPinching,
  suppressBecausePinchEnded,
}: CableLayerPointerUpPreflightInput): CableLayerPointerUpPreflightDecision {
  if (isModalOpen || isPinching) return "ignore";
  if (suppressBecausePinchEnded) return "ignore-after-pinch";
  return "process";
}

export function isPointerUpPrimary(button: number, pointerType: string): boolean {
  return button === 0 || pointerType === "touch";
}
