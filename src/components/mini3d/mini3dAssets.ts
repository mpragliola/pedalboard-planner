import { BASE_URL } from "../../constants";

export type ImageCacheEntry = HTMLImageElement | "error";

// Resolve optional image paths to absolute URLs.
export function resolveImageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http") || path.startsWith("data:")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}

export function getTextureImage(
  src: string,
  imageCache: Map<string, ImageCacheEntry>,
  onLoad: () => void
): HTMLImageElement | null {
  // Cache and reuse image resources for top textures.
  const cachedImage = imageCache.get(src);
  if (cachedImage === "error") return null;
  let img = cachedImage as HTMLImageElement | undefined;

  if (!img) {
    img = new Image();
    // Hint to browser to decode off-main-thread.
    img.decoding = "async";
    img.src = src;
    img.onload = () => onLoad();
    img.onerror = () => {
      imageCache.set(src, "error");
      onLoad();
    };
    imageCache.set(src, img);
  }
  // Return null if not yet loaded or errored.
  if (!img.complete || img.naturalWidth === 0) return null;

  return img;
}
