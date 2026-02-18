import {
  getTemplateImage,
  getTemplateShape,
  getTemplateWdh,
  hasKnownTemplateDimensions,
} from "./objectDimensions";
import {
  parseState,
  serializeState,
  type SavedState,
  type StateTemplateResolver,
} from "./stateSerialization";

/**
 * Runtime resolver that enriches parsed records with template dimensions,
 * image paths, and shapes.
 */
const TEMPLATE_RESOLVER: StateTemplateResolver = {
  hasKnownTemplateDimensions,
  getTemplateImage,
  getTemplateShape,
  getTemplateWdh,
};

/** Parse persisted state using runtime template enrichment rules. */
export function parseStateWithRuntimeTemplates(json: string): SavedState | null {
  return parseState(json, { templateResolver: TEMPLATE_RESOLVER });
}

/** Serialize persisted state using runtime known-template optimization rules. */
export function serializeStateWithRuntimeTemplates(state: SavedState): Record<string, unknown> {
  return serializeState(state, { templateResolver: TEMPLATE_RESOLVER });
}
