# Component hierarchy

React component tree for the pedalboard editor app. Components are under `src/components/` unless noted.

---

## Root

```
App
├── ConfirmationProvider (context)
│   └── AppProvider (context)
│       └── SettingsModalProvider (context)
│           └── CatalogDndProvider
│               └── AppContent
```

---

## AppContent

```
AppContent
├── Canvas
├── Mini3DOverlay                        (conditional: when showMini3d or during close)
├── catalog-panel (div)
│   ├── catalog-panel-head
│   │   ├── catalog-panel-toggle (button)   → setFloatingUiVisible
│   │   ├── BoardMenu
│   │   └── panel-expand-btn (button)       → setPanelExpanded
│   └── catalog-panel-body
│       └── DropdownsPanel
├── SideControls
├── BottomControls
├── SelectionInfoPopup
├── SettingsModal
├── disclaimer (p)
└── footer.copyright
```

---

## BoardMenu

```
BoardMenu
├── New board (button)     → requestConfirmation + newBoard
├── Load (button)          → file input click
├── input[type=file]       (hidden)
├── Save (button)          → saveBoardToFile
├── GptButton
├── InfoButton
└── SettingsButton
```

- **GptButton** toggles **GptModal** (open state in button).
- **InfoButton** toggles **InfoModal** (open state in button).
- **SettingsButton** toggles **SettingsModal** (open state in button).

---

## DropdownsPanel

```
DropdownsPanel
├── catalog-switches-row
│   └── CatalogModeSwitch          (Boards | Devices buttons)
└── dropdown-group.catalog-content
    ├── [boards mode]
    │   ├── Brand (select)
    │   ├── Filters (collapsible toggle + content)
    │   │   └── TextFilter, SizeFilters, Reset filters (button)
    │   ├── CatalogList             (boards list; onAdd → onBoardSelect)
    │   └── Custom board (collapsible)
    │       └── CustomItemForm
    └── [devices mode]
        ├── Type (select), Brand (select)
        ├── Filters (collapsible)
        │   └── TextFilter, SizeFilters, Reset filters (button)
        ├── CatalogListGrouped       (devices by type; onAdd → onDeviceSelect)
        └── Custom device (collapsible)
            └── CustomItemForm
```

**CatalogList** / **CatalogListGrouped**:

- Header: label + **ViewModeToggle** (text / list / grid / large).
- Scrollable list of items (buttons): `onPointerDown` → `useCatalogItemDrag`; tap → `onAdd`, long-press → catalog drag.
- **CatalogListGrouped** wraps items in collapsible groups (device type headers).

---

## Canvas

```
Canvas
├── canvas-bg (div)
├── canvas-viewport
│   └── canvas-viewport-zoom
│       ├── Grid                    (optional, when showGrid)
│       ├── SelectionToolbar        (when exactly one object selected)
│       ├── CableToolbar            (when a cable is selected)
│       └── CanvasObject[]          (one per object)
│   └── CablePaths                  (cable SVG overlay)
├── AddCableModal                   (when editing cable)
└── RulerOverlay                    (when ruler)
    or LineRulerOverlay             (when lineRuler)
    or CableLayerOverlay            (when cableLayer)
```

- **Canvas** root: `onPointerDown` → handleCanvasPointerDown (selection clear + pan start); `onClick` →
  setFloatingUiVisible(false) unless shouldIgnoreCatalogClick.
- **SelectionToolbar**: positioned above selected object; **SelectionToolbarButton** × 4 (Rotate, Send to back, Bring to front, Delete);
  pointer/mouse down stopPropagation.
- **CanvasObject**: wrapper div; `onPointerDown` → setPointerCapture + onObjectPointerDown (selection + object drag
  start); `onPointerUp` → onDragEnd when dragging.

---

## SideControls

```
SideControls
├── SideControl (Add cable)          → toggle cable layer (and disable rulers)
├── SideControl (Show cables)        → toggle cable visibility
├── SideControl (3D view)            → toggle Mini3DOverlay
├── view-tools-group (expandable)
│   ├── SideControl (view options toggle)
│   └── view-tools-secondary
│       ├── SideControl (center view)
│       ├── SideControl (grid toggle)
│       ├── SideControl (x-ray toggle)
│       └── SideControl (fullscreen toggle)
├── measurement-tools-group (expandable)
│   ├── SideControl (measurement tools toggle)
│   └── measurement-tools-secondary
│       ├── SideControl (ruler toggle)
│       └── SideControl (line ruler toggle)
├── SideControl (component list)     → opens ComponentListModal
└── ComponentListModal
```

---

## BottomControls

```
BottomControls
├── HistoryButton (undo)
├── HistoryButton (redo)
├── ZoomButton (zoom in)
└── ZoomButton (zoom out)
```

---

## SelectionInfoPopup

Shown when exactly one object is selected. Renders selected object name and dimensions (width, depth, height) with
**InfoLine** rows.

---

## Modals (rendered via portal or conditionally)

| Modal                  | Rendered by                   | Trigger                                                                                   |
| ---------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| **ConfirmationDialog** | ConfirmationProvider (portal) | requestConfirmation() from BoardMenu (New), SelectionToolbar (Delete), ComponentListModal |
| **GptModal**           | GptButton                     | Click GptButton                                                                           |
| **InfoModal**          | InfoButton                    | Click InfoButton                                                                          |
| **SettingsModal**      | SettingsButton                | Click SettingsButton                                                                      |
| **ComponentListModal** | ZoomControls                  | Click “Component list” in ZoomControls                                                    |
| **AddCableModal**       | Canvas                        | Edit selected cable                                                                        |

**SettingsModal** uses **Modal** (common). **ComponentListModal** and **InfoModal** use their own layout; **GptModal**
and **ConfirmationDialog** are standalone.

---

## Ruler overlays

- **RulerOverlay**: full overlay on canvas; pointer down starts rectangle drag; pointer up commits; click again (when
  not drawing) or Escape exits. Uses **LineRulerOverlay**-style length display for the segment.
- **LineRulerOverlay**: polyline ruler; uses **usePolylineDraw**; pointer down/move/up + double-click or Escape to exit;
  **useCanvasCoords** for client ↔ canvas; displays segments and total length.

---

## Shared / primitives

- **Modal** (`components/common/Modal.tsx`): `<dialog>` wrapper with open/onClose and title.
- **ZoomButton**: icon button used in ZoomControls (zoom, grid, ruler, etc.).
- **HistoryButton**: icon button for undo/redo.
- **SelectionToolbarButton**: icon button used in SelectionToolbar (rotate, send to back, delete).
- **InfoLine**: label + value line used in SelectionInfoPopup (and elsewhere if needed).

---

## Context providers (not components in the tree)

- **ConfirmationProvider**: provides `requestConfirmation`; renders **ConfirmationDialog** via portal when pending.
- **AppProvider** (in `src/context/AppContext.tsx`): provides app state (objects, selection, zoom, pan, catalog drag,
  handlers, etc.).
