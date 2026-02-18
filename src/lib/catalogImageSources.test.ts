import { describe, expect, it } from "vitest";
import { BASE_URL } from "../constants/runtime";
import { buildCatalogImageSourceSet } from "./catalogImageSources";

function withBase(path: string): string {
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

describe("buildCatalogImageSourceSet", () => {
  it("builds full-size and thumbnail URLs for standard catalog image paths", () => {
    const out = buildCatalogImageSourceSet(
      "images/devices/boss/boss-ds1.png",
      "(max-width: 900px) 96px, 192px"
    );

    const small = withBase("images-thumbs/devices/boss/boss-ds1.w96.webp");
    const large = withBase("images-thumbs/devices/boss/boss-ds1.w192.webp");

    expect(out).toEqual({
      src: small,
      srcSet: `${small} 96w, ${large} 192w`,
      fullSrc: withBase("images/devices/boss/boss-ds1.png"),
      sizes: "(max-width: 900px) 96px, 192px",
    });
  });

  it("supports paths that do not include the images/ prefix", () => {
    const out = buildCatalogImageSourceSet("devices/boss/boss-ds1.png", "120px");

    expect(out.src).toBe(withBase("images-thumbs/devices/boss/boss-ds1.w96.webp"));
    expect(out.fullSrc).toBe(withBase("devices/boss/boss-ds1.png"));
  });

  it("normalizes windows-style and leading-slash paths", () => {
    const out = buildCatalogImageSourceSet("\\images\\boards\\aclam\\aclam-smart-track-xs2.png", "200px");

    expect(out.src).toBe(withBase("images-thumbs/boards/aclam/aclam-smart-track-xs2.w96.webp"));
    expect(out.fullSrc).toBe(withBase("images/boards/aclam/aclam-smart-track-xs2.png"));
  });

  it("handles catalog image paths without file extensions", () => {
    const out = buildCatalogImageSourceSet("/images/devices/custom/noext", "50vw");

    expect(out.srcSet).toContain(withBase("images-thumbs/devices/custom/noext.w96.webp"));
    expect(out.srcSet).toContain(withBase("images-thumbs/devices/custom/noext.w192.webp"));
    expect(out.fullSrc).toBe(withBase("images/devices/custom/noext"));
    expect(out.sizes).toBe("50vw");
  });
});
