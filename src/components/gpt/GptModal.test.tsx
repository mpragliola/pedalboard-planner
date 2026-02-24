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
  const flushMicrotasks = async () => {
    await Promise.resolve();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("resets copied state after timeout while mounted", async () => {
    render(<GptModal open onClose={vi.fn()} />);

    const copyButton = screen.getByRole("button", { name: /copy to clipboard/i });
    await act(async () => {
      fireEvent.click(copyButton);
      await flushMicrotasks();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await flushMicrotasks();
    });

    expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it("clears pending copy timeout on unmount", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = render(<GptModal open onClose={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));
      await flushMicrotasks();
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();

    act(() => {
      unmount();
    });

    // Unmount should cancel the pending timer to avoid post-unmount state updates.
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("adds routing/settings guidance to the prompt when checkboxes are enabled", async () => {
    render(<GptModal open onClose={vi.fn()} />);

    const routingCheckbox = screen.getByRole("checkbox", {
      name: /ask for the best routing/i,
    });
    const settingsCheckbox = screen.getByRole("checkbox", {
      name: /ask for the best settings/i,
    });

    await act(async () => {
      fireEvent.click(routingCheckbox);
      fireEvent.click(settingsCheckbox);
      await flushMicrotasks();
    });

    const textarea = screen.getByLabelText(/prompt \(you can edit before copying\)/i);
    expect(textarea).toHaveValue(expect.stringContaining("Suggest the best routing"));
    expect(textarea).toHaveValue(expect.stringContaining("Suggest best starting settings"));
  });
});
