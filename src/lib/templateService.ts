import type { CanvasObjectType } from "../types";
import type { Shape3D } from "../shape3d";
import type { Wdh } from "../wdh";
import {
  getTemplateImage as lookupTemplateImage,
  getTemplateShape as lookupTemplateShape,
  getTemplateWdh as lookupTemplateWdh,
  hasKnownTemplateDimensions as lookupHasKnownTemplateDimensions,
} from "./objectDimensions";

export interface TemplateLookup {
  getTemplateImage: (templateId?: string) => string | null;
  getTemplateShape: (templateId?: string) => Shape3D | undefined;
  getTemplateWdh: (templateId?: string) => Wdh | undefined;
  hasKnownTemplateDimensions: (templateId?: string) => boolean;
}

const DEFAULT_TEMPLATE_LOOKUP: TemplateLookup = {
  getTemplateImage: lookupTemplateImage,
  getTemplateShape: lookupTemplateShape,
  getTemplateWdh: lookupTemplateWdh,
  hasKnownTemplateDimensions: lookupHasKnownTemplateDimensions,
};

/**
 * Domain-facing template service.
 * Owns policy decisions such as template dimensions taking precedence.
 */
export class TemplateService {
  constructor(private readonly lookup: TemplateLookup) {}

  getTemplateImage = (templateId?: string): string | null => this.lookup.getTemplateImage(templateId);

  getTemplateShape = (templateId?: string): Shape3D | undefined => this.lookup.getTemplateShape(templateId);

  getTemplateWdh = (templateId?: string): Wdh | undefined => this.lookup.getTemplateWdh(templateId);

  hasKnownTemplateDimensions = (templateId?: string): boolean =>
    this.lookup.hasKnownTemplateDimensions(templateId);

  /**
   * Business policy: known template dimensions are source of truth;
   * otherwise use object-specific dimensions.
   */
  getObjectDimensions = (obj: CanvasObjectType): [number, number, number] => {
    const fromTemplate = this.getTemplateWdh(obj.templateId);
    return fromTemplate ?? [obj.width, obj.depth, obj.height];
  };
}

export const templateService = new TemplateService(DEFAULT_TEMPLATE_LOOKUP);
