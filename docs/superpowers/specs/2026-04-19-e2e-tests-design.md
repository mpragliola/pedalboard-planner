# E2E Test Suite Design

**Date:** 2026-04-19  
**Goal:** Regression safety + feature confidence via a comprehensive Playwright e2e suite covering all major user flows.

---

## Infrastructure

### Playwright config (`playwright.config.ts` at project root)

- `webServer`: runs `vite build` then `vite preview` before tests; no manual server required, works in CI
- Base URL: `http://localhost:4173/pedalboard-planner/`
- Browser: Chromium only (matches screenshot pipeline)
- Test directory: `e2e/`
- Reporters: `html` (local) + `github` (CI)

### Shared fixtures (`e2e/fixtures.ts`)

- Extends Playwright's base `test` with a `seedState(state)` method: injects JSON into `localStorage["pedal/state"]` via `addInitScript` before navigation, then waits for `.canvas` to be visible
- Exports `BASE_STATE` (Pedaltrain Metro 24 + 3 Boss pedals + 2 cables, zoom 1.5, pan {144,178}) and `EMPTY_STATE`
- Seed constants are the same as used in `scripts/take-screenshots.ts`

### Coordinate helper (`e2e/helpers.ts`)

- `cc(posX, posY, zoom, panX, panY)` — converts canvas-space mm coordinates to client pixels
- All tests that click specific objects use `cc()` — no raw pixel coordinates hardcoded
- Default params match `BASE_STATE` zoom/pan

---

## Page Objects (`e2e/pages/`)

### `AppPage`
- `goto(seedState?)` — navigate + optional localStorage seed, wait for `.canvas`
- `minimizeCatalog()` — collapses `.catalog-panel-body`
- `canvas` — locator for `.canvas`

### `CatalogPage`
- `switchToDevices()` / `switchToBoards()`
- `searchFor(text)` — types into text filter input
- `filterByType(type)` — selects from `#device-type-filter`
- `clickItem(index)` — clicks item to place at viewport center
- `firstItem` — locator for first `.catalog-list-item`

### `CanvasPage`
- `clickAt(x, y)` — clicks a client coordinate
- `dragFrom(from, to)` — drags an object between client coordinates
- `selectionToolbar` — locator for `.selection-toolbar`
- `deleteSelected()` — clicks Delete button in selection toolbar
- `rotate()` — clicks Rotate button in selection toolbar
- `undo()` / `redo()` — Ctrl+Z / Ctrl+Y keyboard shortcuts
- `getStoredState()` — reads and parses `localStorage["pedal/state"]`
- `getStoredObjects()` — returns `objects[]` from stored state
- `getStoredCables()` — returns `cables[]` from stored state

### `CablePage`
- `enterCableMode()` — clicks `.cable-layer-toggle`, waits for overlay
- `exitCableMode()` — presses Escape
- `drawPoints(points)` — clicks each `{x, y}` point in sequence
- `openAddCableModal()` — clicks `.cable-layer-add-btn`
- `addCableModal` — locator for `.modal-content` first
- `clickCable(x, y)` — clicks an existing cable to select it
- `cableToolbar` — locator for `.cable-toolbar`
- `cycleCableVisibility()` — clicks `.cables-visible-toggle`

### `BoardMenuPage`
- `clickNew()` — clicks New board button (triggers confirmation dialog)
- `confirmNew()` — clicks Confirm in confirmation dialog
- `openSettings()` — opens SettingsModal
- `openGpt()` — opens GptModal
- `confirmationDialog` — locator for `.confirmation-dialog`

---

## Test Suite

### `e2e/smoke.spec.ts`
1. App loads — canvas visible, catalog panel visible
2. Empty state — no objects in localStorage on first load
3. Catalog shows boards by default

### `e2e/catalog.spec.ts`
1. Switch to Devices tab → device items appear
2. Filter by type → list narrows
3. Search by text → list narrows
4. Click a board item → object appears in stored state
5. Click a device item → object appears in stored state

### `e2e/canvas-objects.spec.ts` (seeds `BASE_STATE`)
1. Click object → selection toolbar appears
2. Press Escape → toolbar hides
3. Click Delete in toolbar → confirmation dialog → confirm → object removed from stored state
4. Rotate → stored object rotation increases by 90°
5. Drag object → stored position changes
6. Undo after delete → object restored in stored state
7. Redo → object deleted again

### `e2e/cables.spec.ts` (seeds `BASE_STATE`)
1. Enter cable mode → overlay visible
2. Draw two points → add-cable button appears
3. Open add-cable modal → modal visible
4. Escape cancels in-progress cable → overlay still active, add-cable button hidden
5. Click existing cable → cable toolbar appears
6. Delete cable from toolbar → cable removed from stored state
7. Cycle visibility → toggle button class changes

### `e2e/persistence.spec.ts`
1. Place an object, reload page → object still in stored state and visible on canvas
2. Clear board (New + confirm) → stored state has no objects

---

## Assertions Strategy

- **Behavioral**: DOM presence and visibility (e.g. toolbar appears, modal opens, overlay active)
- **State-based**: `localStorage["pedal/state"]` parsed and asserted after mutations (object count, position, rotation, cable presence)
- Canvas clicks use `cc()` coordinates derived from seed state — never raw pixels

---

## Out of Scope (first suite)

- Cross-browser testing
- Mobile / touch gesture flows
- 3D view rendering
- Ruler / measurement tools
- GPT modal content
- File load/save (requires file system interaction)
