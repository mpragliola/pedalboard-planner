import { templateService } from "./templateService";
import {
  parseState,
  serializeState,
  type SavedState,
  type StateTemplateResolver,
} from "./stateSerialization";

/**
 * Minimum runtime template API needed by the serialization codec.
 * Accepting this shape (instead of importing the singleton everywhere)
 * allows callers/tests to inject deterministic lookup behavior.
 */
export interface RuntimeTemplateLookup {
  hasKnownTemplateDimensions: (templateId?: string) => boolean;
  getTemplateImage: (templateId?: string) => string | null;
  getTemplateShape: (templateId?: string) => ReturnType<typeof templateService.getTemplateShape>;
  getTemplateWdh: (templateId?: string) => ReturnType<typeof templateService.getTemplateWdh>;
}

/** Build a state-serialization resolver from any runtime template lookup source. */
export function createRuntimeTemplateResolver(templateLookup: RuntimeTemplateLookup): StateTemplateResolver {
  return {
    hasKnownTemplateDimensions: templateLookup.hasKnownTemplateDimensions,
    getTemplateImage: templateLookup.getTemplateImage,
    getTemplateShape: templateLookup.getTemplateShape,
    getTemplateWdh: templateLookup.getTemplateWdh,
  };
}

/** Default production resolver backed by the app's TemplateService singleton. */
export const DEFAULT_RUNTIME_TEMPLATE_RESOLVER = createRuntimeTemplateResolver(templateService);

/** Parse persisted state using runtime template enrichment rules. */
export function parseStateWithRuntimeTemplates(
  json: string,
  templateResolver: StateTemplateResolver = DEFAULT_RUNTIME_TEMPLATE_RESOLVER
): SavedState | null {
  return parseState(json, { templateResolver });
}

/** Serialize persisted state using runtime known-template optimization rules. */
export function serializeStateWithRuntimeTemplates(
  state: SavedState,
  templateResolver: StateTemplateResolver = DEFAULT_RUNTIME_TEMPLATE_RESOLVER
): Record<string, unknown> {
  return serializeState(state, { templateResolver });
}
