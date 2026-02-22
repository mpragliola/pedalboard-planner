/**
 * Pure decision helpers for CableLayerOverlay pointer-down handling.
 *
 * Why this exists:
 * - keep branching rules out of JSX event handlers
 * - make guard precedence explicit and testable
 * - reduce regression risk when adding new guards
 */
export interface CableLayerPointerDownPreflight {
  /** Parent-owned add-cable modal is open; overlay must be inert. */
  isModalOpen: boolean;
  /** Only primary mouse button and touch pointers are allowed to start drawing. */
  isPrimaryPointer: boolean;
  /** Pointer is over Add/Cancel action controls; do not treat as draw input. */
  overActions: boolean;
  /** Space key pan mode is active, so canvas pan owns pointer input. */
  spaceDown: boolean;
}

export function canHandleCableLayerPointerDown({
  isModalOpen,
  isPrimaryPointer,
  overActions,
  spaceDown,
}: CableLayerPointerDownPreflight): boolean {
  // All preflight blockers are hard stops before any gesture claim is attempted.
  return !isModalOpen && isPrimaryPointer && !overActions && !spaceDown;
}

export interface CableLayerPointerDownDecisionInput {
  /** Number of active pointers after adding the current pointer id. */
  activePointerCount: number;
  /** Overlay is already in pinch suppression mode. */
  isPinching: boolean;
  /** Current pointer-down qualifies as a double-tap gesture. */
  isDoubleTap: boolean;
}

export type CableLayerPointerDownDecision = "begin-pinch" | "ignore" | "double-tap" | "draw";

export function resolveCableLayerPointerDownDecision({
  activePointerCount,
  isPinching,
  isDoubleTap,
}: CableLayerPointerDownDecisionInput): CableLayerPointerDownDecision {
  // Decision precedence is intentional:
  // 1) Two pointers always transitions into pinch suppression.
  // 2) Existing pinch suppression blocks all draw actions.
  // 3) Double tap triggers finish/exit.
  // 4) Otherwise start normal draw handling.
  if (activePointerCount >= 2) return "begin-pinch";
  if (isPinching) return "ignore";
  if (isDoubleTap) return "double-tap";
  return "draw";
}

export function isPrimaryCableLayerPointer(button: number, pointerType: string): boolean {
  // Touch pointers do not map cleanly to "left button", so allow all touch here.
  return button === 0 || pointerType === "touch";
}
