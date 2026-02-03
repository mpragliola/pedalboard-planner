/**
 * Utility for capturing global pointer events during drag operations.
 * Centralizes the common pattern of tracking pointer move/up/cancel events.
 */

export interface PointerCaptureHandlers {
  /** Called on pointermove. Return false to end capture early. */
  onMove?: (e: PointerEvent) => void | false;
  /** Called on pointerup or pointercancel */
  onEnd?: (e: PointerEvent) => void;
  /** If true, calls preventDefault on move events (default: true) */
  preventDefaultOnMove?: boolean;
}

export interface PointerCaptureResult {
  /** Call to manually end capture and remove listeners */
  release: () => void;
}

/**
 * Captures global pointer events for a specific pointer ID.
 * Automatically filters events by pointer ID and handles cleanup.
 *
 * @param pointerId - The pointer ID to track (from PointerEvent.pointerId)
 * @param handlers - Event handlers for move and end events
 * @returns Object with release() function to manually end capture
 *
 * @example
 * ```ts
 * const { release } = capturePointer(e.pointerId, {
 *   onMove: (ev) => {
 *     position.current = { x: ev.clientX, y: ev.clientY };
 *   },
 *   onEnd: (ev) => {
 *     console.log('Drag ended at', ev.clientX, ev.clientY);
 *   },
 * });
 *
 * // Later, to cancel early:
 * release();
 * ```
 */
export function capturePointer(pointerId: number, handlers: PointerCaptureHandlers): PointerCaptureResult {
  const { onMove, onEnd, preventDefaultOnMove = true } = handlers;
  let released = false;

  const handleMove = (e: PointerEvent) => {
    if (e.pointerId !== pointerId || released) return;
    if (preventDefaultOnMove) e.preventDefault();
    if (onMove?.(e) === false) {
      release();
    }
  };

  const handleEnd = (e: PointerEvent) => {
    if (e.pointerId !== pointerId || released) return;
    release();
    onEnd?.(e);
  };

  const release = () => {
    if (released) return;
    released = true;
    window.removeEventListener("pointermove", handleMove, captureOptions);
    window.removeEventListener("pointerup", handleEnd, captureOptions);
    window.removeEventListener("pointercancel", handleEnd, captureOptions);
  };

  // Use capture phase and non-passive for move (to allow preventDefault)
  const captureOptions = { capture: true } as const;
  const moveOptions = { capture: true, passive: false } as const;

  window.addEventListener("pointermove", handleMove, moveOptions);
  window.addEventListener("pointerup", handleEnd, captureOptions);
  window.addEventListener("pointercancel", handleEnd, captureOptions);

  return { release };
}

/**
 * Creates a pointer capture that tracks position and calls handlers.
 * Convenience wrapper that also tracks current position.
 *
 * @example
 * ```ts
 * const { release, getPosition } = capturePointerWithPosition(e.pointerId, {
 *   initialPosition: { x: e.clientX, y: e.clientY },
 *   onMove: (pos) => updateGhost(pos),
 *   onEnd: (pos) => placeObject(pos),
 * });
 * ```
 */
export function capturePointerWithPosition(
  pointerId: number,
  options: {
    initialPosition: { x: number; y: number };
    onMove?: (position: { x: number; y: number }, e: PointerEvent) => void | false;
    onEnd?: (position: { x: number; y: number }, e: PointerEvent) => void;
    preventDefaultOnMove?: boolean;
  }
): PointerCaptureResult & { getPosition: () => { x: number; y: number } } {
  let position = { ...options.initialPosition };

  const { release } = capturePointer(pointerId, {
    preventDefaultOnMove: options.preventDefaultOnMove,
    onMove: (e) => {
      position = { x: e.clientX, y: e.clientY };
      return options.onMove?.(position, e);
    },
    onEnd: (e) => {
      position = { x: e.clientX, y: e.clientY };
      options.onEnd?.(position, e);
    },
  });

  return {
    release,
    getPosition: () => ({ ...position }),
  };
}
