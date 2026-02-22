export interface CableLayerPointerDownPreflight {
  isModalOpen: boolean;
  isPrimaryPointer: boolean;
  overActions: boolean;
  spaceDown: boolean;
}

export function canHandleCableLayerPointerDown({
  isModalOpen,
  isPrimaryPointer,
  overActions,
  spaceDown,
}: CableLayerPointerDownPreflight): boolean {
  return !isModalOpen && isPrimaryPointer && !overActions && !spaceDown;
}

export interface CableLayerPointerDownDecisionInput {
  activePointerCount: number;
  isPinching: boolean;
  isDoubleTap: boolean;
}

export type CableLayerPointerDownDecision = "begin-pinch" | "ignore" | "double-tap" | "draw";

export function resolveCableLayerPointerDownDecision({
  activePointerCount,
  isPinching,
  isDoubleTap,
}: CableLayerPointerDownDecisionInput): CableLayerPointerDownDecision {
  if (activePointerCount >= 2) return "begin-pinch";
  if (isPinching) return "ignore";
  if (isDoubleTap) return "double-tap";
  return "draw";
}

export function isPrimaryCableLayerPointer(button: number, pointerType: string): boolean {
  return button === 0 || pointerType === "touch";
}
