# UI interactions

List of user interactions: where they happen, what they do, and which components/hooks handle them.

---

## 1. App / global

| Interaction                            | Where       | Effect                                                         |
| -------------------------------------- | ----------- | -------------------------------------------------------------- |
| **Context menu (right-click)**         | app-content | `preventDefault` (disabled)                                    |
| **Ctrl/Cmd+Z**                         | window      | Undo                                                           |
| **Ctrl/Cmd+Y** or **Ctrl/Cmd+Shift+Z** | window      | Redo                                                           |
| **Space key down**                     | window      | Set spaceDown → canvas shows grab cursor, next pointer can pan |
| **Space key up**                       | window      | Clear spaceDown; if panning, stop pan                          |
| **Escape**                             | window      | When ruler: exit ruler; when line ruler: exit line ruler       |

---

## 2. Catalog panel

| Interaction                                        | Where                                                   | Effect                                                                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Click** catalog-panel-toggle (chevron)           | Panel header                                            | Toggle floating UI (expand/collapse panel body)                                                                                                                                               |
| **Click** panel-expand-btn (left/right chevron)    | Panel header                                            | Toggle panelExpanded (wider panel on desktop)                                                                                                                                                 |
| **Pointer down** on catalog item (board or device) | CatalogList / CatalogListGrouped (CatalogDraggableItem) | @dnd-kit: useDraggable on each item. Click → add at viewport center (onClick). Long-press (TouchSensor delay) or drag (PointerSensor) → start drag; panel slides away (body.catalog-dragging) |
| **Drag** (catalog item)                            | DndContext + DragOverlay                                | Ghost follows pointer; drop on canvas droppable (useDroppable on viewport) → placeFromCatalog converts coords and adds object                                                                 |
| **Drag end** (catalog)                             | DndContext onDragEnd                                    | Remove body class (panel back); if over canvas, place object; else no place                                                                                                                   |
| **Click** Boards / Devices                         | CatalogModeSwitch                                       | Set catalog mode (boards or devices)                                                                                                                                                          |
| **Change** Brand / Type / filters                  | DropdownsPanel selects and filters                      | Filter catalog list                                                                                                                                                                           |
| **Click** Filters / Custom board / Custom device   | Collapsible toggles                                     | Expand or collapse filter or custom form section                                                                                                                                              |
| **Click** Reset filters                            | Button in filter section                                | Clear current filters                                                                                                                                                                         |
| **Click** view mode (☰ ☷ ▦ ⊞)                      | ViewModeToggle in CatalogList                           | Set catalog view: text, list, grid, large                                                                                                                                                     |
| **Click** device type group header                 | CatalogListGrouped                                      | Collapse or expand that device type group                                                                                                                                                     |
| **Submit** custom board/device form                | CustomItemForm                                          | Create custom board or device and add at viewport center                                                                                                                                      |

---

## 3. Board menu (file actions)

| Interaction           | Where          | Effect                                        |
| --------------------- | -------------- | --------------------------------------------- |
| **Click** New         | BoardMenu      | Request confirmation → clear board (newBoard) |
| **Click** Load        | BoardMenu      | Open file picker (hidden input)               |
| **Change** file input | BoardMenu      | loadBoardFromFile(selected file)              |
| **Click** Save        | BoardMenu      | saveBoardToFile (download JSON)               |
| **Click** GPT         | GptButton      | Open GptModal                                 |
| **Click** Info        | InfoButton     | Open InfoModal                                |
| **Click** Settings    | SettingsButton | Open SettingsModal                            |

---

## 4. Canvas

| Interaction                                       | Where                         | Effect                                                                                                                                  |
| ------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Pointer down** on empty canvas (left, no space) | Canvas root                   | Clear selection; start pan (isPanning, window move/up for this pointerId)                                                               |
| **Pointer down** on empty canvas (middle button)  | Canvas root                   | Start pan                                                                                                                               |
| **Pointer down** on empty canvas (left + Space)   | Canvas root                   | Start pan                                                                                                                               |
| **Pointer move** (while panning)                  | window (capture)              | Update pan (filter by pointerId)                                                                                                        |
| **Pointer up / cancel** (while panning)           | window (capture)              | Stop pan                                                                                                                                |
| **Click** on canvas (not on object)               | Canvas root                   | setFloatingUiVisible(false) unless shouldIgnoreCatalogClick() (e.g. after catalog drop)                                                 |
| **Wheel** on canvas                               | Canvas (via useCanvasZoomPan) | Zoom toward cursor (throttled, pivot)                                                                                                   |
| **Touch** (two fingers) on canvas                 | Canvas element                | Pinch zoom; onPinchStart clears object drag                                                                                             |
| **Pointer down** on object                        | CanvasObject                  | setPointerCapture on canvas; set selection to this object; start object drag (pendingDrag then draggingObjectId, window move/up/cancel) |
| **Pointer move** (object drag)                    | window (capture)              | Move selected object(s); update position                                                                                                |
| **Pointer up / cancel** (object drag)             | window (capture)              | End object drag (clearDragState)                                                                                                        |

---

## 5. Selection and toolbar

| Interaction                           | Where                  | Effect                                                  |
| ------------------------------------- | ---------------------- | ------------------------------------------------------- |
| **Pointer down** on selection toolbar | SelectionToolbar       | stopPropagation (so canvas does not deselect)           |
| **Click** Rotate                      | SelectionToolbarButton | Rotate selected object 90°                              |
| **Click** Send to back                | SelectionToolbarButton | Move selected object to bottom of stack                 |
| **Click** Delete                      | SelectionToolbarButton | Request confirmation → delete object and its connectors |

Selection is changed only by: pointer down on canvas (clear), pointer down on object (set to that object).
SelectionInfoPopup shows dimensions when exactly one object is selected (read-only, no interaction).

---

## 6. Zoom and view controls

| Interaction                  | Where                   | Effect                                                |
| ---------------------------- | ----------------------- | ----------------------------------------------------- |
| **Click** Zoom in / Zoom out | ZoomControls ZoomButton | zoomIn() / zoomOut()                                  |
| **Click** Center view        | ZoomControls            | centerView()                                          |
| **Click** Grid toggle        | ZoomControls            | setShowGrid                                           |
| **Click** X-ray toggle       | ZoomControls            | setXray                                               |
| **Click** View options       | ZoomControls            | Expand/collapse view group                            |
| **Click** Ruler              | ZoomControls            | Toggle ruler (rectangle measure); turn off line ruler |
| **Click** Line ruler         | ZoomControls            | Toggle line ruler (polyline); turn off ruler          |
| **Click** Measurement tools  | ZoomControls            | Expand/collapse measurement group                     |
| **Click** Component list     | ZoomControls            | Open ComponentListModal                               |

---

## 7. History

| Interaction    | Where                         | Effect                          |
| -------------- | ----------------------------- | ------------------------------- |
| **Click** Undo | HistoryControls HistoryButton | undo() (disabled when !canUndo) |
| **Click** Redo | HistoryControls HistoryButton | redo() (disabled when !canRedo) |

---

## 8. Ruler overlay (when ruler is on)

| Interaction                                       | Where                 | Effect                                            |
| ------------------------------------------------- | --------------------- | ------------------------------------------------- |
| **Pointer down**                                  | RulerOverlay          | Start rectangle drag (setRect); setPointerCapture |
| **Pointer move**                                  | RulerOverlay          | Update rectangle (x2, y2)                         |
| **Pointer up**                                    | RulerOverlay / window | Commit rectangle; release capture                 |
| **Click** (when rect already drawn, not dragging) | RulerOverlay          | setRuler(false) (exit ruler)                      |
| **Escape**                                        | window                | setRuler(false)                                   |

---

## 9. Line ruler overlay (when line ruler is on)

| Interaction      | Where            | Effect                                                              |
| ---------------- | ---------------- | ------------------------------------------------------------------- |
| **Pointer down** | LineRulerOverlay | Add segment point or start new segment; setPointerCapture on target |
| **Pointer move** | LineRulerOverlay | Update current segment end (preview)                                |
| **Pointer up**   | LineRulerOverlay | Commit segment end                                                  |
| **Double-click** | LineRulerOverlay | Exit line ruler mode                                                |
| **Escape**       | window           | setLineRuler(false)                                                 |

---

## 10. Modals

| Interaction                    | Where                                                  | Effect                                       |
| ------------------------------ | ------------------------------------------------------ | -------------------------------------------- |
| **Click** Confirm / Cancel     | ConfirmationDialog                                     | Resolve promise (true/false); close dialog   |
| **Click** Close / backdrop     | GptModal, InfoModal, SettingsModal, ComponentListModal | onClose (close modal)                        |
| **Change** inputs / selects    | SettingsModal                                          | Unit, grid, etc. (per modal implementation)  |
| **Submit** / **Click** actions | ComponentListModal                                     | Add/edit/delete connectors; export CSV; etc. |

---

## 11. Pointer and capture summary

- **Catalog item**: One pointer session per pointer down on an item; window listeners (move/up/cancel) for that
  pointerId; no setPointerCapture on element (to avoid breaking scroll).
- **Canvas pan**: Window move/up/cancel when isPanning; handlers filter by pointerId.
- **Object drag**: setPointerCapture on canvas from CanvasObject; window move/up/cancel when pendingDrag or
  draggingObjectId (currently not filtered by pointerId in code).
- **Ruler**: setPointerCapture on overlay; window pointerup for release.
- **Line ruler**: setPointerCapture on element; usePolylineDraw + local pointer handlers.

All of these use **capture** phase for window listeners so they see events before other handlers. Catalog drag and panel
visibility are tied to startCatalogDrag/endCatalogDrag (body class and catalogDrag state).
