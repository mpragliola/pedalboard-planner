import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GptModal } from "./GptModal";

vi.mock("../../context/BoardContext", () => ({
  useBoard: () => ({ objects: [] }),
}));

vi.mock("../../context/CableContext", () => ({
  useCable: () => ({ cables: [] }),
}));

vi.mock("../../context/UiContext", () => ({
  useUi: () => ({ unit: "mm" }),
}));

vi.mock("../common/Modal", () => ({
  // Keep tests focused on GptModal state/timer behavior.
  // Dialog portal/focus behavior is already tested in Modal/useDialogControl tests.
  Modal: ({
    open,
    children,
  }: {
    open: boolean;
    children: ReactNode;
  }) => (open ? <div data-testid="mock-modal">{children}</div> : null),
}));

describe("GptModal copy timer", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("resets copied state after timeout while mounted", async () => {
    render(<GptModal open onClose={vi.fn()} />);

    const copyButton = screen.getByRole("button", { name: /copy to clipboard/i });
    fireEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it("clears pending copy timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = render(<GptModal open onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));
    expect(writeText).toHaveBeenCalledTimes(1);

    unmount();

    // Unmount should cancel the pending timer to avoid post-unmount state updates.
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
