# Catalog drag: @dnd-kit implementation

## Current implementation

Catalog-to-canvas drag uses **@dnd-kit**:

- **CatalogDndProvider** wraps the app and provides `DndContext` with:
  - **Sensors**: `PointerSensor` (desktop) and `TouchSensor` with
    `activationConstraint: { delay: LONG_PRESS_MS, tolerance: MOVE_THRESHOLD_PX }` for long-press on mobile.
  - **onDragStart**: adds `body.catalog-dragging` (panel slides away), tracks pointer position for drop.
  - **onDragEnd**: removes body class; if dropped over canvas, calls `placeFromCatalog(clientX, clientY, data)`.
- **CatalogDraggableItem**: each catalog list item uses `useDraggable`; click = add at center, long-press + drag = drag
  to canvas.
- **Canvas** uses `useDroppable({ id: CANVAS_DROP_ID })` on the viewport so drops are detected.
- **DragOverlay** shows the ghost (image or placeholder) during drag; position is managed by dnd-kit.
- **useCatalogDrag** (simplified): only `placeFromCatalog(clientX, clientY, data)` (converts to canvas coords and calls
  `onDropOnCanvas`) and `shouldIgnoreCatalogClick()` (so the next canvas click doesn’t close the panel).

Object-on-canvas drag and pan/zoom are unchanged and do not use dnd-kit.

---

## Other libraries (for reference)

| Library                                 | Pros                                        | Cons                                                               |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| **react-dnd**                           | Battle-tested, many examples.               | Older API; long-press for touch usually via custom backend/sensor. |
| **Pragmatic drag and drop** (Atlassian) | Accessibility-first, pointer/touch handled. | Newer; may need customisation for “drag from list to canvas”.      |

We chose @dnd-kit for touch delay/tolerance, clear sensor API, and a single droppable canvas with draggable catalog
items.
