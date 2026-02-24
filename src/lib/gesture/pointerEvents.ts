/**
 * Attach pointermove / pointerup / pointercancel listeners on `window`
 * in the capture phase.  Returns a cleanup function that removes all three.
 *
 * Designed to be called inside a `useEffect` and returned directly:
 * ```ts
 * useEffect(() => {
 *   if (!active) return;
 *   return addGlobalPointerListeners(handleMove, handleUp);
 * }, [active]);
 * ```
 */
export function addGlobalPointerListeners(
  onMove: (e: PointerEvent) => void,
  onUp: (e: PointerEvent) => void
): () => void {
  window.addEventListener("pointermove", onMove, { capture: true });
  window.addEventListener("pointerup", onUp, { capture: true });
  window.addEventListener("pointercancel", onUp, { capture: true });
  return () => {
    window.removeEventListener("pointermove", onMove, { capture: true });
    window.removeEventListener("pointerup", onUp, { capture: true });
    window.removeEventListener("pointercancel", onUp, { capture: true });
  };
}
