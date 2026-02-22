import type { HistoryCommand } from "../hooks/useHistory";
import type { Cable, CanvasObjectType } from "../types";
import type { BoardState } from "./useBoardPersistence";

function moveItemToIndexById<T extends { id: string }>(items: T[], id: string, targetIndex: number): T[] | null {
  const fromIndex = items.findIndex((item) => item.id === id);
  if (fromIndex < 0) return null;
  const safeTarget = Math.max(0, Math.min(targetIndex, items.length - 1));
  if (fromIndex === safeTarget) return null;

  const next = items.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(safeTarget, 0, item);
  return next;
}

function replaceObjectById(
  objects: CanvasObjectType[],
  id: string,
  updater: (object: CanvasObjectType) => CanvasObjectType
): CanvasObjectType[] | null {
  const index = objects.findIndex((object) => object.id === id);
  if (index < 0) return null;
  const current = objects[index];
  const updated = updater(current);
  if (updated === current) return null;
  const next = objects.slice();
  next[index] = updated;
  return next;
}

function replaceCableById(cables: Cable[], id: string, updater: (cable: Cable) => Cable): Cable[] | null {
  const index = cables.findIndex((cable) => cable.id === id);
  if (index < 0) return null;
  const current = cables[index];
  const updated = updater(current);
  if (updated === current) return null;
  const next = cables.slice();
  next[index] = updated;
  return next;
}

/** Command: rotate one object by 90 degrees with reversible previous rotation state. */
export function createRotateObjectCommand(id: string): HistoryCommand<BoardState> {
  let capturedPreviousRotation: number | undefined;
  let hasCaptured = false;

  return {
    label: "rotate-object",
    redo: (state) => {
      const nextObjects = replaceObjectById(state.objects, id, (object) => {
        if (!hasCaptured) {
          capturedPreviousRotation = object.rotation;
          hasCaptured = true;
        }
        return { ...object, rotation: ((object.rotation ?? 0) + 90) % 360 };
      });
      if (!nextObjects) return state;
      return { ...state, objects: nextObjects };
    },
    undo: (state) => {
      if (!hasCaptured) return state;
      const nextObjects = replaceObjectById(state.objects, id, (object) => ({
        ...object,
        rotation: capturedPreviousRotation,
      }));
      if (!nextObjects) return state;
      return { ...state, objects: nextObjects };
    },
  };
}

/** Command: delete object and restore it at original stack index on undo. */
export function createDeleteObjectCommand(id: string): HistoryCommand<BoardState> {
  let removedObject: CanvasObjectType | null = null;
  let removedIndex = -1;

  return {
    label: "delete-object",
    redo: (state) => {
      const index = state.objects.findIndex((object) => object.id === id);
      if (index < 0) return state;
      if (!removedObject) {
        removedObject = state.objects[index];
        removedIndex = index;
      }
      return {
        ...state,
        objects: state.objects.slice(0, index).concat(state.objects.slice(index + 1)),
      };
    },
    undo: (state) => {
      if (!removedObject || removedIndex < 0) return state;
      if (state.objects.some((object) => object.id === removedObject?.id)) return state;
      const next = state.objects.slice();
      next.splice(Math.min(removedIndex, next.length), 0, removedObject);
      return { ...state, objects: next };
    },
  };
}

/** Command: move object to the back (index 0), restoring previous index on undo. */
export function createSendObjectToBackCommand(id: string): HistoryCommand<BoardState> {
  let originalIndex = -1;

  return {
    label: "send-object-to-back",
    redo: (state) => {
      const index = state.objects.findIndex((object) => object.id === id);
      if (index <= 0) return state;
      if (originalIndex < 0) originalIndex = index;
      const next = moveItemToIndexById(state.objects, id, 0);
      if (!next) return state;
      return { ...state, objects: next };
    },
    undo: (state) => {
      if (originalIndex < 0) return state;
      const next = moveItemToIndexById(state.objects, id, originalIndex);
      if (!next) return state;
      return { ...state, objects: next };
    },
  };
}

/** Command: move object to front, restoring previous index on undo. */
export function createBringObjectToFrontCommand(id: string): HistoryCommand<BoardState> {
  let originalIndex = -1;

  return {
    label: "bring-object-to-front",
    redo: (state) => {
      const index = state.objects.findIndex((object) => object.id === id);
      if (index < 0 || index === state.objects.length - 1) return state;
      if (originalIndex < 0) originalIndex = index;
      const next = moveItemToIndexById(state.objects, id, state.objects.length - 1);
      if (!next) return state;
      return { ...state, objects: next };
    },
    undo: (state) => {
      if (originalIndex < 0) return state;
      const next = moveItemToIndexById(state.objects, id, originalIndex);
      if (!next) return state;
      return { ...state, objects: next };
    },
  };
}

/** Command: add cable (append) and remove it on undo. */
export function createAddCableCommand(cable: Cable): HistoryCommand<BoardState> {
  return {
    label: "add-cable",
    redo: (state) => {
      if (state.cables.some((entry) => entry.id === cable.id)) return state;
      return { ...state, cables: [...state.cables, cable] };
    },
    undo: (state) => {
      const index = state.cables.findIndex((entry) => entry.id === cable.id);
      if (index < 0) return state;
      return { ...state, cables: state.cables.slice(0, index).concat(state.cables.slice(index + 1)) };
    },
  };
}

/** Command: replace cable by id (edit) and restore previous version on undo. */
export function createUpsertCableCommand(cable: Cable): HistoryCommand<BoardState> {
  let previousCable: Cable | null = null;
  let previousIndex = -1;
  let createdNew = false;

  return {
    label: "upsert-cable",
    redo: (state) => {
      const index = state.cables.findIndex((entry) => entry.id === cable.id);
      if (index < 0) {
        createdNew = true;
        return { ...state, cables: [...state.cables, cable] };
      }
      if (!previousCable) {
        previousCable = state.cables[index];
        previousIndex = index;
      }
      const next = replaceCableById(state.cables, cable.id, () => cable);
      if (!next) return state;
      return { ...state, cables: next };
    },
    undo: (state) => {
      if (createdNew && !previousCable) {
        const index = state.cables.findIndex((entry) => entry.id === cable.id);
        if (index < 0) return state;
        return { ...state, cables: state.cables.slice(0, index).concat(state.cables.slice(index + 1)) };
      }
      if (!previousCable) return state;
      const index = state.cables.findIndex((entry) => entry.id === cable.id);
      if (index >= 0) {
        const next = replaceCableById(state.cables, cable.id, () => previousCable as Cable);
        if (!next) return state;
        return { ...state, cables: next };
      }
      const next = state.cables.slice();
      next.splice(Math.min(previousIndex, next.length), 0, previousCable);
      return { ...state, cables: next };
    },
  };
}

/** Command: delete cable and restore it at original index on undo. */
export function createDeleteCableCommand(id: string): HistoryCommand<BoardState> {
  let removedCable: Cable | null = null;
  let removedIndex = -1;

  return {
    label: "delete-cable",
    redo: (state) => {
      const index = state.cables.findIndex((cable) => cable.id === id);
      if (index < 0) return state;
      if (!removedCable) {
        removedCable = state.cables[index];
        removedIndex = index;
      }
      return {
        ...state,
        cables: state.cables.slice(0, index).concat(state.cables.slice(index + 1)),
      };
    },
    undo: (state) => {
      if (!removedCable || removedIndex < 0) return state;
      if (state.cables.some((cable) => cable.id === removedCable?.id)) return state;
      const next = state.cables.slice();
      next.splice(Math.min(removedIndex, next.length), 0, removedCable);
      return { ...state, cables: next };
    },
  };
}

/** Command: move cable to back and restore previous index on undo. */
export function createSendCableToBackCommand(id: string): HistoryCommand<BoardState> {
  let originalIndex = -1;
  return {
    label: "send-cable-to-back",
    redo: (state) => {
      const index = state.cables.findIndex((cable) => cable.id === id);
      if (index <= 0) return state;
      if (originalIndex < 0) originalIndex = index;
      const next = moveItemToIndexById(state.cables, id, 0);
      if (!next) return state;
      return { ...state, cables: next };
    },
    undo: (state) => {
      if (originalIndex < 0) return state;
      const next = moveItemToIndexById(state.cables, id, originalIndex);
      if (!next) return state;
      return { ...state, cables: next };
    },
  };
}

/** Command: move cable to front and restore previous index on undo. */
export function createBringCableToFrontCommand(id: string): HistoryCommand<BoardState> {
  let originalIndex = -1;
  return {
    label: "bring-cable-to-front",
    redo: (state) => {
      const index = state.cables.findIndex((cable) => cable.id === id);
      if (index < 0 || index === state.cables.length - 1) return state;
      if (originalIndex < 0) originalIndex = index;
      const next = moveItemToIndexById(state.cables, id, state.cables.length - 1);
      if (!next) return state;
      return { ...state, cables: next };
    },
    undo: (state) => {
      if (originalIndex < 0) return state;
      const next = moveItemToIndexById(state.cables, id, originalIndex);
      if (!next) return state;
      return { ...state, cables: next };
    },
  };
}
