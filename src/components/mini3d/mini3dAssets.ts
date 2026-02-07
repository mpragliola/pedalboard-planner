import { BASE_URL } from "../../constants";

export function resolveImageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http") || path.startsWith("data:")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}
