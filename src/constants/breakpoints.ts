/**
 * Shared responsive breakpoints (in CSS px).
 *
 * Centralizing these avoids drift between components that should respond at
 * the same viewport widths.
 */
export const BREAKPOINT_MOBILE_PX = 600;
export const BREAKPOINT_TABLET_PX = 767;

/** Canonical media queries used by `useMediaQuery(...)` call sites. */
export const MEDIA_QUERY_MAX_MOBILE = `(max-width: ${BREAKPOINT_MOBILE_PX}px)`;
export const MEDIA_QUERY_MAX_TABLET = `(max-width: ${BREAKPOINT_TABLET_PX}px)`;

