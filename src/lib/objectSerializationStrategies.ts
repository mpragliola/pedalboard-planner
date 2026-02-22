import type { CanvasObjectType } from "../types";

/**
 * Minimal resolver contract needed by serialization strategies.
 * Kept local to avoid coupling strategy module to full state codec implementation details.
 */
export interface SerializationTemplateResolver {
  hasKnownTemplateDimensions: (templateId?: string) => boolean;
}

/** Context passed to each serialization strategy. */
export interface ObjectSerializationContext {
  templateResolver?: SerializationTemplateResolver;
  round: (value: number) => number;
}

/**
 * Strategy contract for object serialization.
 * `matches` selects the strategy for an object and `serialize` performs the transformation.
 */
export interface ObjectSerializationStrategy {
  matches: (object: CanvasObjectType, context: ObjectSerializationContext) => boolean;
  serialize: (object: CanvasObjectType, context: ObjectSerializationContext) => Record<string, unknown>;
}

function isCustomTemplateId(templateId?: string): boolean {
  return templateId === "board-custom" || templateId === "device-custom";
}

function createBaseSerializedObject(
  object: CanvasObjectType,
  context: ObjectSerializationContext
): Record<string, unknown> {
  const {
    image: _image,
    shape: _shape,
    width: _width,
    depth: _depth,
    height: _height,
    pos,
    ...rest
  } = object;
  return {
    ...rest,
    // Coordinates are rounded at serialization boundary to keep payload stable.
    pos: { x: context.round(pos.x), y: context.round(pos.y) },
    // Base includes name; non-custom strategy explicitly strips it.
    name: object.name,
  };
}

/** Strategy: custom objects retain user-facing name and explicit dimensions. */
export const customObjectSerializationStrategy: ObjectSerializationStrategy = {
  matches: (object) => isCustomTemplateId(object.templateId),
  serialize: (object, context) => ({
    ...createBaseSerializedObject(object, context),
    width: object.width,
    depth: object.depth,
    height: object.height,
  }),
};

/**
 * Strategy: template-backed objects strip runtime-only fields.
 * Dimensions are omitted when template resolver confirms known dimensions.
 */
export const templateObjectSerializationStrategy: ObjectSerializationStrategy = {
  matches: () => true,
  serialize: (object, context) => {
    const out = createBaseSerializedObject(object, context);
    delete out.name;
    const hasKnownTemplateDimensions = context.templateResolver
      ? context.templateResolver.hasKnownTemplateDimensions(object.templateId)
      : false;
    if (!hasKnownTemplateDimensions) {
      out.width = object.width;
      out.depth = object.depth;
      out.height = object.height;
    }
    return out;
  },
};

/** Default ordered strategy list; first matching strategy wins. */
export const DEFAULT_OBJECT_SERIALIZATION_STRATEGIES: ObjectSerializationStrategy[] = [
  customObjectSerializationStrategy,
  templateObjectSerializationStrategy,
];

/** Applies ordered strategy list to one object. */
export function serializeObjectWithStrategies(
  object: CanvasObjectType,
  context: ObjectSerializationContext,
  strategies: ObjectSerializationStrategy[] = DEFAULT_OBJECT_SERIALIZATION_STRATEGIES
): Record<string, unknown> {
  const strategy = strategies.find((entry) => entry.matches(object, context));
  if (!strategy) {
    throw new Error("No object serialization strategy matched.");
  }
  return strategy.serialize(object, context);
}

