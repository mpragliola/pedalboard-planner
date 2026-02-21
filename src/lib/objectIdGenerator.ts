import type { CanvasObjectType } from "../types";

export interface ObjectIdGenerator {
  nextId: () => string;
  seedFromObjects: (objects: CanvasObjectType[]) => void;
}

/** Create a local ID generator instance owned by callers (no module-global state). */
export function createObjectIdGenerator(getNow: () => number = Date.now): ObjectIdGenerator {
  let nextObjectId = 1;
  let idPrefix = getNow();

  const parseCounterSuffix = (id: string): number => {
    const parts = id.split("-");
    const counter = parseInt(parts[parts.length - 1], 10);
    return Number.isNaN(counter) ? 0 : counter;
  };

  return {
    nextId: () => `${idPrefix}-${nextObjectId++}`,
    seedFromObjects: (objects) => {
      let maxId = 0;
      for (const object of objects) {
        maxId = Math.max(maxId, parseCounterSuffix(object.id));
      }
      nextObjectId = maxId + 1;
      // Refresh prefix on load so restored/corrupted IDs cannot collide with new ones.
      idPrefix = getNow();
    },
  };
}
