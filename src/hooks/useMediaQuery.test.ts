import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

const ORIGINAL_MATCH_MEDIA = window.matchMedia;

function setupMatchMedia(initialMatches: boolean) {
  const listeners = new Set<EventListenerOrEventListenerObject>();

  const mediaQueryList = {
    media: "",
    matches: initialMatches,
    onchange: null,
    addEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => {
      if (event === "change") listeners.add(cb);
    }),
    removeEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => {
      if (event === "change") listeners.delete(cb);
    }),
    dispatchEvent: vi.fn(() => true),
  } as unknown as MediaQueryList;

  const matchMedia = vi.fn((query: string) => {
    (mediaQueryList as { media: string }).media = query;
    return mediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: matchMedia,
  });

  const notify = () => {
    const event = new Event("change");
    for (const listener of listeners) {
      if (typeof listener === "function") {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    }
  };

  return {
    matchMedia,
    mediaQueryList,
    setMatches(next: boolean) {
      (mediaQueryList as { matches: boolean }).matches = next;
      notify();
    },
  };
}

describe("useMediaQuery", () => {
  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: ORIGINAL_MATCH_MEDIA,
    });
    vi.restoreAllMocks();
  });

  it("reads the initial match value from matchMedia", () => {
    const mock = setupMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(max-width: 900px)"));

    expect(result.current).toBe(true);
    expect(mock.matchMedia).toHaveBeenCalledWith("(max-width: 900px)");
  });

  it("updates when the media query emits a change event", () => {
    const mock = setupMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 900px)"));

    expect(result.current).toBe(false);

    act(() => {
      mock.setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it("removes the listener on unmount", () => {
    const mock = setupMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery("(max-width: 900px)"));

    const registeredCallback = (mock.mediaQueryList.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1];
    unmount();

    expect(mock.mediaQueryList.removeEventListener).toHaveBeenCalledWith("change", registeredCallback);
  });
});
