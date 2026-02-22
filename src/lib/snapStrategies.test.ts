import { describe, expect, it } from "vitest";
import type { CanvasObjectType } from "../types";
import {
  createChainedSnapStrategy,
  createConditionalSnapStrategy,
  createGridSnapStrategy,
  createIdentitySnapStrategy,
  createObjectSnapStrategy,
  type ModifierSnapContext,
  type ObjectSnapContext,
} from "./snapStrategies";

type TestSnapContext = ModifierSnapContext & ObjectSnapContext;

function makeObject(): CanvasObjectType {
  return {
    id: "o1",
    subtype: "device",
    type: "pedal",
    brand: "Boss",
    model: "DS-1",
    name: "Boss DS-1",
    pos: { x: 0, y: 0 },
    width: 40,
    depth: 20,
    height: 50,
    image: null,
  };
}

const getObjectDimensions = (object: CanvasObjectType): [number, number, number] => [
  object.width,
  object.depth,
  object.height,
];

describe("snapStrategies", () => {
  it("identity strategy leaves point unchanged", () => {
    const strategy = createIdentitySnapStrategy<TestSnapContext>();
    const point = strategy.snap(
      { x: 12, y: 34 },
      { shiftKey: false, objects: [makeObject()], getObjectDimensions }
    );
    expect(point).toEqual({ x: 12, y: 34 });
  });

  it("grid strategy rounds to nearest grid step", () => {
    const strategy = createGridSnapStrategy<TestSnapContext>(10);
    const point = strategy.snap(
      { x: 14, y: 26 },
      { shiftKey: false, objects: [makeObject()], getObjectDimensions }
    );
    expect(point).toEqual({ x: 10, y: 30 });
  });

  it("conditional strategy can bypass object snapping when shift is held", () => {
    const strategy = createConditionalSnapStrategy<TestSnapContext>(
      (context) => context.shiftKey,
      createIdentitySnapStrategy<TestSnapContext>(),
      createObjectSnapStrategy<TestSnapContext>()
    );

    const raw = { x: 41, y: 10 };
    const bypassed = strategy.snap(raw, {
      shiftKey: true,
      objects: [makeObject()],
      getObjectDimensions,
      toleranceMm: 10,
    });
    expect(bypassed).toEqual(raw);

    const snapped = strategy.snap(raw, {
      shiftKey: false,
      objects: [makeObject()],
      getObjectDimensions,
      toleranceMm: 10,
    });
    expect(snapped).toEqual({ x: 40, y: 10 });
  });

  it("chained strategy applies strategies in order", () => {
    const strategy = createChainedSnapStrategy<TestSnapContext>([
      createGridSnapStrategy<TestSnapContext>(10),
      createIdentitySnapStrategy<TestSnapContext>(),
    ]);
    const point = strategy.snap(
      { x: 14, y: 26 },
      { shiftKey: false, objects: [makeObject()], getObjectDimensions }
    );
    expect(point).toEqual({ x: 10, y: 30 });
  });
});

