import type { DeviceTemplate, DeviceType } from "./devices";
import type { Shape3D } from "../shape3d";
import { deviceId } from "../lib/slug";
import type { Wdh } from "../wdh";

/** Input for building a device template. Name defaults to `${brandName} ${model}`. */
export interface DeviceTemplateInput {
  model: string;
  wdh: Wdh;
  image: string | null;
  type?: DeviceType;
  name?: string;
  color?: string;
  shape?: Shape3D;
}

/**
 * Build a full DeviceTemplate from brand and per-device fields.
 * Id is generated via deviceId(brandSlug, model); name defaults to `${brandName} ${model}`.
 */
export function deviceTemplate(brandSlug: string, brandName: string, input: DeviceTemplateInput): DeviceTemplate {
  const { model, wdh, image, name, color, shape } = input;
  const type = input.type ?? "pedal";
  return {
    id: deviceId(brandSlug, model),
    type,
    brand: brandName,
    model,
    name: name ?? `${brandName} ${model}`,
    wdh,
    image,
    ...(color != null ? { color } : {}),
    ...(shape != null ? { shape } : {}),
  };
}

/** Image path under images/devices/: returns `brandSlug/filename`. */
export function deviceImage(brandSlug: string, filename: string): string {
  return `${brandSlug}/${filename}`;
}

/**
 * Create helpers for a brand so each template call only passes model, wdh, image (and optional name).
 * Use img(filename) for image paths under the brand folder.
 */
export function createBrandHelpers(brandSlug: string, brandName: string) {
  const img = (filename: string) => deviceImage(brandSlug, filename);

  function device(type: DeviceType, model: string, wdh: Wdh, image: string | null, name?: string): DeviceTemplate {
    return deviceTemplate(brandSlug, brandName, { type, model, wdh, image, name });
  }

  const pedal = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("pedal", model, wdh, image, name);
  const multifx = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("multifx", model, wdh, image, name);
  const power = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("power", model, wdh, image, name);
  const controller = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("controller", model, wdh, image, name);
  const expression = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("expression", model, wdh, image, name);
  const wireless = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("wireless", model, wdh, image, name);
  const loopswitcher = (model: string, wdh: Wdh, image: string | null, name?: string) =>
    device("loopswitcher", model, wdh, image, name);

  return {
    device,
    pedal,
    multifx,
    power,
    controller,
    expression,
    wireless,
    loopswitcher,
    img,
    /** Build one template with full control (e.g. custom name or type). */
    template: (input: DeviceTemplateInput) => deviceTemplate(brandSlug, brandName, input),
  };
}
