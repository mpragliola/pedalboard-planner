// Shared RGB helpers for color parsing and shading.
export type Rgb = { r: number; g: number; b: number };

// Clamp channel values into 0-255 and round to integer.
export function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

// Parse a hex or rgb/rgba string into an RGB struct.
export function parseColor(input: string): Rgb | null {
  const value = input.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }
  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }
  return null;
}

// Apply a brightness factor to an RGB color.
export function shade(rgb: Rgb, factor: number): Rgb {
  return {
    r: clampChannel(rgb.r * factor),
    g: clampChannel(rgb.g * factor),
    b: clampChannel(rgb.b * factor),
  };
}

// Format an RGB color as an rgba() CSS string.
export function rgba(rgb: Rgb, alpha: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
