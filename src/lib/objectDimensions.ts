/** Template-based dimension + image helpers. */
import type { CanvasObjectType } from "../types";
import type { Shape3D } from "../shape3d";
import { DEVICE_TEMPLATES } from "../data/devices";
import { BOARD_TEMPLATES } from "../data/boards";
import { MM_TO_PX } from "../constants";
import { Wdh } from "../wdh";

/** 
 * Build lookup maps from template id to image path and dimensions.
 * These maps will be used to get object dimensions and images based 
 * on their templateId. We use this implementation because templates
 * are static data and we want fast access without React hooks.
 */

/** Build a lookup map from template id to image path. */
const templateImageMap: Map<string, string | null> = new Map();

/** Build a lookup map from template id to [width, depth, height] in px. */
const templateWdhMap: Map<string, Wdh> = new Map();

/** Build a lookup map from template id to 3D shape. */
const templateShapeMap: Map<string, Shape3D> = new Map();

for (const t of DEVICE_TEMPLATES) {
  templateImageMap.set(t.id, t.image ? `images/devices/${t.image}` : null);
  if (t.wdh) {
    templateWdhMap.set(t.id, [t.wdh[0] * MM_TO_PX, t.wdh[1] * MM_TO_PX, t.wdh[2] * MM_TO_PX]);
  }
  if (t.shape) {
    templateShapeMap.set(t.id, t.shape);
  }
}
for (const t of BOARD_TEMPLATES) {
  templateImageMap.set(t.id, t.image ? `images/boards/${t.image}` : null);
  if (t.wdh) {
    templateWdhMap.set(t.id, [t.wdh[0] * MM_TO_PX, t.wdh[1] * MM_TO_PX, t.wdh[2] * MM_TO_PX]);
  }
}

export function getTemplateImage(templateId?: string): string | null {
  if (!templateId) return null;
  return templateImageMap.get(templateId) ?? null;
}

export function getTemplateWdh(templateId?: string): Wdh | undefined {
  if (!templateId) return undefined;
  return templateWdhMap.get(templateId);
}

export function hasKnownTemplateDimensions(templateId?: string): boolean {
  return !!templateId && templateWdhMap.has(templateId);
}

export function getTemplateShape(templateId?: string): Shape3D | undefined {
  if (!templateId) return undefined;
  return templateShapeMap.get(templateId);
}

/** Returns [width, depth, height] in px. For known templates, always from template (source of truth). */
export function getObjectDimensions(obj: CanvasObjectType): [number, number, number] {
  const tid = obj.templateId;
  if (tid && templateWdhMap.has(tid)) {
    return templateWdhMap.get(tid)!;
  }
  return [obj.width, obj.depth, obj.height];
}

