import { afterEach, describe, expect, it, vi } from "vitest";
import { addGlobalPointerListeners } from "./pointerEvents";

describe("addGlobalPointerListeners", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches pointermove/pointerup/pointercancel listeners in capture phase", () => {
    const addSpy = vi.spyOn(window, "addEventListener").mockImplementation(() => undefined);
    const onMove = vi.fn();
    const onUp = vi.fn();

    const cleanup = addGlobalPointerListeners(onMove, onUp);

    expect(typeof cleanup).toBe("function");
    expect(addSpy).toHaveBeenCalledTimes(3);
    expect(addSpy).toHaveBeenCalledWith("pointermove", onMove, { capture: true });
    expect(addSpy).toHaveBeenCalledWith("pointerup", onUp, { capture: true });
    expect(addSpy).toHaveBeenCalledWith("pointercancel", onUp, { capture: true });
  });

  it("removes the same listeners when cleanup is called", () => {
    vi.spyOn(window, "addEventListener").mockImplementation(() => undefined);
    const removeSpy = vi.spyOn(window, "removeEventListener").mockImplementation(() => undefined);
    const onMove = vi.fn();
    const onUp = vi.fn();

    const cleanup = addGlobalPointerListeners(onMove, onUp);
    cleanup();

    expect(removeSpy).toHaveBeenCalledTimes(3);
    expect(removeSpy).toHaveBeenCalledWith("pointermove", onMove, { capture: true });
    expect(removeSpy).toHaveBeenCalledWith("pointerup", onUp, { capture: true });
    expect(removeSpy).toHaveBeenCalledWith("pointercancel", onUp, { capture: true });
  });
});
