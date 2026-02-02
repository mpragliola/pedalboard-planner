/**
 * Slugify a model string for use in template ids: lowercase, spaces/slashes to hyphens, strip other
 * non-alphanumeric.
 */
export function modelToSlug(model: string): string {
  return model
    .toLowerCase()
    .replace(/\s|\//g, "-") // substitute spaces and slashes with hyphens
    .replace(/-+/g, "-") // replace multiple hyphens with a single hyphen
    .replace(/^-|-$/g, "") // remove leading and trailing hyphens
    .replace(/[^a-z0-9\-]/g, ""); // remove other non-alphanumeric characters
}

/**
 * Build a device template id from brand slug and model (e.g. deviceId('eventide', 'H9 / H90') →
 * 'device-eventide-h9-h90').
 */
export function deviceId(brandSlug: string, model: string): string {
  return `device-${brandSlug}-${modelToSlug(model)}`;
}

/**
 * Build a board template id from brand slug and model (e.g. boardId('aclam', 'Smart Track XS1') →
 * 'board-aclam-smart-track-xs1').
 */
export function boardId(brandSlug: string, model: string): string {
  return `board-${brandSlug}-${modelToSlug(model)}`;
}
