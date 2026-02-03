import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { capturePointer, capturePointerWithPosition } from "./pointerCapture";

describe("capturePointer", () => {
  let target: HTMLDivElement;

  beforeEach(() => {
    target = document.createElement("div");
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.removeChild(target);
  });

  it("calls onMove when pointermove fires with matching pointerId", () => {
    const onMove = vi.fn();
    const onEnd = vi.fn();
    capturePointer(1, { onMove, onEnd });

    const moveEv = new PointerEvent("pointermove", { pointerId: 1, clientX: 50, clientY: 60 });
    window.dispatchEvent(moveEv);

    expect(onMove).toHaveBeenCalledWith(moveEv);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("ignores pointermove for different pointerId", () => {
    const onMove = vi.fn();
    capturePointer(1, { onMove });

    const moveEv = new PointerEvent("pointermove", { pointerId: 2, clientX: 50, clientY: 60 });
    window.dispatchEvent(moveEv);

    expect(onMove).not.toHaveBeenCalled();
  });

  it("calls onEnd when pointerup fires with matching pointerId", () => {
    const onMove = vi.fn();
    const onEnd = vi.fn();
    capturePointer(1, { onMove, onEnd });

    const upEv = new PointerEvent("pointerup", { pointerId: 1, clientX: 100, clientY: 200 });
    window.dispatchEvent(upEv);

    expect(onEnd).toHaveBeenCalledWith(upEv);
  });

  it("calls onEnd when pointercancel fires", () => {
    const onEnd = vi.fn();
    capturePointer(1, { onEnd });

    const cancelEv = new PointerEvent("pointercancel", { pointerId: 1, clientX: 0, clientY: 0 });
    window.dispatchEvent(cancelEv);

    expect(onEnd).toHaveBeenCalledWith(cancelEv);
  });

  it("stops tracking after release() is called", () => {
    const onMove = vi.fn();
    const { release } = capturePointer(1, { onMove });
    release();

    const moveEv = new PointerEvent("pointermove", { pointerId: 1, clientX: 50, clientY: 60 });
    window.dispatchEvent(moveEv);

    expect(onMove).not.toHaveBeenCalled();
  });

  it("stops tracking when onMove returns false", () => {
    const onMove = vi.fn().mockReturnValue(false);
    const onEnd = vi.fn();
    capturePointer(1, { onMove, onEnd });

    const moveEv = new PointerEvent("pointermove", { pointerId: 1, clientX: 50, clientY: 60 });
    window.dispatchEvent(moveEv);

    expect(onMove).toHaveBeenCalled();
    // After return false, release is called - next move should be ignored
    const moveEv2 = new PointerEvent("pointermove", { pointerId: 1, clientX: 51, clientY: 61 });
    window.dispatchEvent(moveEv2);
    expect(onMove).toHaveBeenCalledTimes(1);
  });
});

describe("capturePointerWithPosition", () => {
  it("tracks position across move events", () => {
    const positions: { x: number; y: number }[] = [];
    const { getPosition } = capturePointerWithPosition(1, {
      initialPosition: { x: 0, y: 0 },
      onMove: (pos) => {
        positions.push({ ...pos });
      },
    });

    window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 10, clientY: 20 }));
    expect(getPosition()).toEqual({ x: 10, y: 20 });

    window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 30, clientY: 40 }));
    expect(getPosition()).toEqual({ x: 30, y: 40 });
  });

  it("passes final position to onEnd", () => {
    let endPos: { x: number; y: number } | null = null;
    capturePointerWithPosition(1, {
      initialPosition: { x: 0, y: 0 },
      onEnd: (pos) => {
        endPos = pos;
      },
    });

    window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 99, clientY: 88 }));
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, clientX: 99, clientY: 88 }));

    expect(endPos).toEqual({ x: 99, y: 88 });
  });

  it("returns correct position after pointerup", () => {
    const { getPosition } = capturePointerWithPosition(1, {
      initialPosition: { x: 0, y: 0 },
    });

    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, clientX: 77, clientY: 66 }));
    expect(getPosition()).toEqual({ x: 77, y: 66 });
  });
});
