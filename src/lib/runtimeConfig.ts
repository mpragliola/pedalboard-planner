/** Runtime/static asset base URL from Vite (falls back to root). */
export const BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL != null ? import.meta.env.BASE_URL : "/";

function getBooleanEnv(name: string, fallback = false): boolean {
  const value = import.meta.env?.[name];
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

/** Feature flag for click-to-toggle mini3d auto-rotation. */
export const FEATURE_MINI3D_AUTOROTATE = getBooleanEnv("VITE_FEATURE_MINI3D_AUTOROTATE", false);
