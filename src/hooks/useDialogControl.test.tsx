import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialogControl } from "./useDialogControl";

// jsdom's HTMLDialogElement lacks showModal / close — provide minimal mocks
function mockDialogElement(): HTMLDialogElement {
  const el = document.createElement("dialog") as HTMLDialogElement;
  Object.defineProperty(el, "open", { writable: true, value: false });
  el.showModal = vi.fn().mockImplementation(() => {
    (el as { open: boolean }).open = true;
  });
  el.close = vi.fn().mockImplementation(() => {
    (el as { open: boolean }).open = false;
    el.dispatchEvent(new Event("close"));
  });
  document.body.appendChild(el);
  return el;
}

function makeBackdropClick(target: Element): React.MouseEvent<HTMLDialogElement> {
  return { target } as unknown as React.MouseEvent<HTMLDialogElement>;
}

describe("useDialogControl", () => {
  let dialog: HTMLDialogElement;

  beforeEach(() => {
    dialog = mockDialogElement();
  });

  it("returns dialogRef and handleBackdropClick", () => {
    const { result } = renderHook(() => useDialogControl(false, vi.fn()));
    expect(result.current).toHaveProperty("dialogRef");
    expect(result.current).toHaveProperty("handleBackdropClick");
  });

  it("handleBackdropClick calls onClose when the dialog element itself is the event target", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogControl(true, onClose));
    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;

    act(() => { result.current.handleBackdropClick(makeBackdropClick(dialog)); });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("handleBackdropClick does NOT call onClose when target is a child element", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogControl(true, onClose));
    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;

    const child = document.createElement("button");
    dialog.appendChild(child);

    act(() => { result.current.handleBackdropClick(makeBackdropClick(child)); });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("handleBackdropClick respects ignoreBackdropClickForMs — ignores click immediately after open", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useDialogControl(open, onClose, { ignoreBackdropClickForMs: 5000 }),
      { initialProps: { open: false } }
    );

    // Attach ref then open: triggers showModal() and records openedAtRef.current = Date.now() (fake)
    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;
    act(() => { rerender({ open: true }); });

    // Immediately click backdrop — within 5000ms ignore window
    act(() => { result.current.handleBackdropClick(makeBackdropClick(dialog)); });

    expect(onClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("handleBackdropClick allows close after ignoreBackdropClickForMs has elapsed", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useDialogControl(open, onClose, { ignoreBackdropClickForMs: 5000 }),
      { initialProps: { open: false } }
    );

    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;
    act(() => { rerender({ open: true }); });

    // Advance time past the ignore window
    vi.advanceTimersByTime(6000);

    act(() => { result.current.handleBackdropClick(makeBackdropClick(dialog)); });

    expect(onClose).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
