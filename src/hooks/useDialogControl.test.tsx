import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialogControl } from "./useDialogControl";

// jsdom's HTMLDialogElement lacks showModal / close — provide minimal mocks
function mockDialogElement(): HTMLDialogElement {
  const el = document.createElement("dialog") as HTMLDialogElement;
  el.showModal = vi.fn().mockImplementation(() => {
    (el as { open: boolean }).open = true;
  });
  el.close = vi.fn().mockImplementation(() => {
    (el as { open: boolean }).open = false;
    el.dispatchEvent(new Event("close"));
  });
  Object.defineProperty(el, "open", { writable: true, value: false });
  document.body.appendChild(el);
  return el;
}

describe("useDialogControl", () => {
  let dialog: HTMLDialogElement;

  beforeEach(() => {
    dialog = mockDialogElement();
  });

  function useWithRef(open: boolean, onClose = vi.fn(), opts?: Parameters<typeof useDialogControl>[2]) {
    return renderHook(
      ({ o, cb }) => {
        const result = useDialogControl(o, cb, opts);
        // Wire the mock element to the ref after first render
        if (result.dialogRef && !result.dialogRef.current) {
          (result.dialogRef as { current: HTMLDialogElement }).current = dialog;
        }
        return result;
      },
      { initialProps: { o: open, cb: onClose } }
    );
  }

  it("returns dialogRef and handleBackdropClick", () => {
    const { result } = renderHook(() => useDialogControl(false, vi.fn()));
    expect(result.current).toHaveProperty("dialogRef");
    expect(result.current).toHaveProperty("handleBackdropClick");
  });

  it("handleBackdropClick calls onClose when the dialog element itself is the event target", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogControl(true, onClose));
    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;

    act(() => {
      const mockEvent = {
        target: dialog,
      } as unknown as React.MouseEvent<HTMLDialogElement>;
      result.current.handleBackdropClick(mockEvent);
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("handleBackdropClick does NOT call onClose when target is a child element", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialogControl(true, onClose));
    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;

    const child = document.createElement("button");
    dialog.appendChild(child);

    act(() => {
      const mockEvent = {
        target: child,
      } as unknown as React.MouseEvent<HTMLDialogElement>;
      result.current.handleBackdropClick(mockEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("handleBackdropClick respects ignoreBackdropClickForMs", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDialogControl(true, onClose, { ignoreBackdropClickForMs: 5000 })
    );
    (result.current.dialogRef as { current: HTMLDialogElement }).current = dialog;

    // Immediately clicking the backdrop → ignored because we're within the ignore window
    act(() => {
      const mockEvent = {
        target: dialog,
      } as unknown as React.MouseEvent<HTMLDialogElement>;
      result.current.handleBackdropClick(mockEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
