import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LocationLoader } from "./locationLoader";

describe("LocationLoader", () => {
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    globalThis.fetch = originalFetch;
  });

  it("throws when geolocation is not supported", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
    });

    const loader = new LocationLoader();
    await expect(loader.loadFromBrowser()).rejects.toThrow("Geolocation is not supported by your browser.");
  });

  it("throws when getCurrentPosition fails (permission denied)", async () => {
    const getCurrentPosition = vi.fn((_success: () => void, error: () => void) => {
      error();
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { geolocation: { getCurrentPosition } },
      writable: true,
    });

    const loader = new LocationLoader();
    await expect(loader.loadFromBrowser()).rejects.toThrow(
      "Could not get your location. Check permissions or try entering it manually."
    );
  });

  it("returns place name when geolocation and reverse geocode succeed", async () => {
    const position = {
      coords: { latitude: 52.52, longitude: 13.405 },
      timestamp: Date.now(),
    };
    const getCurrentPosition = vi.fn((success: (p: typeof position) => void, _error: () => void) => {
      success(position);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { geolocation: { getCurrentPosition } },
      writable: true,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          city: "Berlin",
          principalSubdivision: "Berlin",
          countryName: "Germany",
        }),
    });
    globalThis.fetch = fetchMock;

    const loader = new LocationLoader();
    const result = await loader.loadFromBrowser();

    expect(result).toBe("Berlin, Berlin, Germany");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("latitude=52.52"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("longitude=13.405"));
  });

  it("throws when reverse geocode fetch fails", async () => {
    const position = {
      coords: { latitude: 0, longitude: 0 },
      timestamp: Date.now(),
    };
    const getCurrentPosition = vi.fn((success: (p: typeof position) => void, _error: () => void) => {
      success(position);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { geolocation: { getCurrentPosition } },
      writable: true,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });

    const loader = new LocationLoader();
    await expect(loader.loadFromBrowser()).rejects.toThrow("Could not resolve location name.");
  });

  it("falls back to lat,lon when geocode returns no locality data", async () => {
    const position = {
      coords: { latitude: -45.5, longitude: 167.2 },
      timestamp: Date.now(),
    };
    const getCurrentPosition = vi.fn((success: (p: typeof position) => void, _error: () => void) => {
      success(position);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { geolocation: { getCurrentPosition } },
      writable: true,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const loader = new LocationLoader();
    const result = await loader.loadFromBrowser();

    expect(result).toBe("-45.50, 167.20");
  });

  it("passes timeout option to getCurrentPosition", async () => {
    const position = {
      coords: { latitude: 0, longitude: 0 },
      timestamp: Date.now(),
    };
    const getCurrentPosition = vi.fn(
      (success: (p: typeof position) => void, _error: () => void, options?: { timeout?: number }) => {
        expect(options?.timeout).toBe(5000);
        success(position);
      }
    );
    Object.defineProperty(globalThis, "navigator", {
      value: { geolocation: { getCurrentPosition } },
      writable: true,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          city: "Test",
          countryName: "Testland",
        }),
    });

    const loader = new LocationLoader();
    await loader.loadFromBrowser({ timeout: 5000 });

    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { timeout: 5000 });
  });
});
