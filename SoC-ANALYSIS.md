# Separation of Concerns — Full Codebase Analysis

> Generated: 2026-02-20
> Scope: `src/context/`, `src/hooks/`, `src/lib/`, `src/data/`, `src/constants/`, `src/components/`

---

## Executive Summary

| Layer | Score | Verdict |
|-------|-------|---------|
| Components | A+ | Excellent — lean, logic-free presentational components |
| Hooks | C+ | Mixed — some hooks do far too many things |
| Contexts | C | Several god-objects and cross-cutting coupling |
| Lib / Utils | B | Mostly pure, but business rules leak into utilities |
| Data / Constants | B- | Good structure, some UI/domain mixing |

The component layer is clean. All the debt is in the state/context/hook layer and the lib utilities.

---

## CRITICAL Issues

### 1. `AppContext.tsx` — God Context (597 lines)

**Problem:** Orchestrates 7 contexts _and_ embeds non-trivial business logic.

Responsibilities it currently owns (all mixed together):
- UI state (grid, ruler, xray, unit, background, mini3d variants)
- Canvas state (zoom, pan, isPanning, spaceDown, canvasAnimating)
- Board operations (delete, rotate, bring-to-front, send-to-back)
- Cable operations (add, persist immediately)
- Object drag coordination
- Cable drag coordination
- Board I/O (new, load, save)
- Catalog interaction (filter selection, drag-drop)
- History management
- Storage persistence

Business logic that does NOT belong here:
```typescript
// Lines 188-284
getPlacementInVisibleViewport()  // placement strategy — should be in placementStrategy.ts
centerView()                     // AABB calc + pan animation — should be CanvasContext
addObjectFromTemplate()          // template resolution + object creation — should use TemplateService
handleBoardSelect() / handleDeviceSelect()  // orchestrates multiple callbacks
handleCustomCreate()             // custom object creation logic
```

Late-binding handler smell (lines 158–179):
```typescript
useEffect(() => {
  setHandlers({
    objectDragStart: handleObjectDragStart,
    cableDragStart: handleCableDragStart,
    // ...
  });
}, [...]);
```
This reveals the absence of a dedicated interaction orchestrator.

---

### 2. `useBoardPersistence.ts` — 35-Parameter Hook

**Problem:** Takes every individual piece of state and every setter as separate parameters.

```typescript
const { newBoard, loadBoardFromFile, saveBoardToFile } = useBoardPersistence({
  objects, cables, historyPast, historyFuture,
  zoom, pan, showGrid, unit, background,
  initialObjects,
  replaceHistoryRaw, setZoom, setPan, setShowGrid,
  setUnit, setBackground, clearSelection,
  loadStateFromFile, saveStateToFile, persistState,
  // ... and more
});
```

Coupling problems:
- Knows about history state (`replaceHistoryRaw`) — that's a HistoryContext concern
- Knows about UI state (`setUnit`, `setBackground`, `setShowGrid`)
- Knows about selection (`clearSelection`)
- Embeds `initNextObjectIdFromObjects()` — business logic in a persistence hook

---

### 3. `ConfirmationContext.tsx` — Rendering Inside a Context (88 lines)

**Problem:** The context renders a portal-mounted `<ConfirmationDialog>` directly inside the provider.

```typescript
return (
  <ConfirmationContext.Provider value={value}>
    {children}
    {pending && createPortal(<ConfirmationDialog {...props} />, document.body)}
  </ConfirmationContext.Provider>
);
```

A context should provide API only — not render UI. The dialog should be mounted once in `App.tsx` via a separate `<ConfirmationDialogPortal />` component.

---

## MODERATE Issues

### 4. `UiContext.tsx` — Canvas Settings Mixed with UI State

`UiContext` manages two distinct concerns:
- **Pure UI toggles:** sidebar state, labels, xray, unit selector → correct
- **Canvas/rendering feature flags:** `showMini3dFloor`, `showMini3dShadows`, `mini3dLowResourceMode`, `showRuler`, `showLineRuler`, `showCableLayer` → belong in a `RenderingContext` or `CanvasContext`

The `mini3dLowResourceMode` storage key (`MINI3D_LOW_RESOURCE_MODE_STORAGE_KEY`) is defined in `AppContext.tsx` and wired through `UiContext` — a clear layering violation.

---

### 5. `CatalogContext.tsx` — Filter Type Coupling

```typescript
// Line 10
filters: ReturnType<typeof useBoardDeviceFilters>
```

The context's type is the exact return shape of a hook implementation detail. Any refactor of the hook breaks the context's type contract. Should be an explicit `CatalogFilters` interface.

---

### 6. `objectDimensions.ts` — Business Rule in a Lookup Utility

The rule _"template dimensions override object props"_ is a business policy. It currently lives in a low-level lookup utility:

```typescript
// getObjectDimensions() in objectDimensions.ts
export function getObjectDimensions(obj: CanvasObjectType): [w, d, h] {
  const fromTemplate = getTemplateDimensions(obj.templateId);
  return fromTemplate ?? [obj.w, obj.d, obj.h]; // ← business rule here
}
```

This logic belongs in a `TemplateService` class, not a generic utility.

---

### 7. `templateHelpers.ts` — Global Mutable State

```typescript
// Module-level globals — fragile, untestable
let nextObjectId = 1;
let idPrefix = '';
```

These survive across renders only by accident (module caching). They don't survive HMR properly (acknowledged in comments). Should be an injected `IdGenerator` service managed by the context.

---

### 8. `stateSerialization.ts` — Three Concerns in One Module

Currently does: parsing + validation + template normalization + serialization.

Should be split:
- `parseSavedState(json)` → raw parse only
- `validateSavedState(data)` → schema checks
- `enrichObjectsWithTemplates(objects, templateService)` → template integration
- `serializeObjects(objects)` → strip runtime-only fields for storage

---

### 9. `useCanvasZoomPan.ts` — 5-in-1 Hook (370 lines)

Combines five independent interaction concerns:
1. Zoom math + constraint
2. Pan tracking + movement
3. Wheel event + throttle + accumulation
4. Touch pinch-to-zoom + two-finger pan
5. Space-key → panning mode toggle
6. CSS transition timing

Should be split into composable sub-hooks.

---

### 10. `useBoardDeviceFilters.ts` — Data Transformation Disguised as a Hook

```typescript
// Directly imports static template data
import { BOARD_TEMPLATES } from '../data/boards';
import { DEVICE_TEMPLATES } from '../data/devices';
```

The filter computation (`applyDimensionFilters`, `applyTextFilter`, range derivation, sorted lists) is a pure data transformation — no React primitives needed. Should be a plain utility in `src/lib/catalogFilters.ts`. The hook should only manage filter state and delegate computation.

---

### 11. `useCablePhysics.ts` — Physics Sim Coupled to React Publishing

```typescript
// Line 193 — publishes every rAF frame regardless of whether sim has settled
setPoints(ps.map(...));
```

The Verlet physics simulation logic and the React state publishing are entangled. The simulation should run as a pure function in `src/lib/cablePhysics.ts`; the hook should only trigger re-renders when the simulation delta exceeds a threshold.

---

### 12. `useDragState.ts` — History Concern in Drag Utility

```typescript
const saveToHistory = !cur.hasPushedHistory;
if (saveToHistory) cur.hasPushedHistory = true;
```

A generic drag utility should not know when to push history. This should be delegated to the callers (`useObjectDrag`, `useCableDrag`).

---

### 13. `useCanvasInteractions.ts` — Selection State Owned by Wrong Layer

This hook manages `selectedIds` state, but selection is a first-class domain concept that multiple contexts need. It should be a `SelectionContext` consumed by interactions, not owned by them.

---

## MINOR Issues

### 14. `GptModal.tsx:36` — PromptBuilder Created Every Render

```typescript
const promptBuilder = new PromptBuilder(objects, { ... }); // runs on every render
const builtPrompt = promptBuilder.build();
```

Fix: wrap in `useMemo` with proper dependencies.

---

### 15. `src/constants/connectors.ts` — UI Icons Mixed with Domain Data

SVG icon paths (UI concern) and `ConnectorKind` definitions (domain concern) live in the same file.

Should be split:
- `src/constants/connector-kinds.ts` — `ConnectorKind`, `CONNECTOR_NAME_OPTIONS`
- `src/constants/connector-icons.ts` — `CONNECTOR_ICON_MAP`

---

### 16. `src/data/devices-brands/*.ts` — Dimension Constants Redefined Per Brand

Each brand file declares its own `WDH_COMPACT`, `WDH_200`, etc. Encourages copy-paste and divergence.

Fix: create `src/constants/device-dimensions.ts` and import everywhere.

---

### 17. `CableContext.tsx` — `addCableAndPersist` Couples Two Concerns

A method named `addCableAndPersist` does two things. The persistence side-effect should be automatic in the persistence layer, and the method should just be `addCable`.

---

## What's Clean (No Action Needed)

- All components in `src/components/` — lean, logic-free, properly delegate to hooks ✓
- `src/lib/vector.ts`, `math.ts`, `geometry2d.ts`, `geometry.ts`, `bounds.ts` — pure math ✓
- `src/lib/slug.ts`, `color.ts`, `rulerFormat.ts`, `pointerEvents.ts` — focused utilities ✓
- `src/lib/placementStrategy.ts` — good strategy pattern ✓
- `src/context/HistoryContext.tsx`, `ModalContext.tsx`, `CanvasContext.tsx`, `BoardContext.tsx` — thin, focused ✓
- `src/types.ts` — clean domain types ✓
- `src/App.tsx`, `src/main.tsx` — no logic bleeding in ✓
- `src/data/devices.ts`, `boards.ts`, `brands.ts` — pure aggregation ✓

---

## Full Refactoring Plan

### Phase 1 — Quick Wins (isolated, no ripple effects)

| Task | Files | Effort |
|------|-------|--------|
| Wrap PromptBuilder in `useMemo` | `GptModal.tsx:36` | 10 min |
| Create `device-dimensions.ts`, update all brand files | `src/constants/device-dimensions.ts`, `src/data/devices-brands/*.ts` | 30 min |
| Split `connectors.ts` into kinds + icons | `src/constants/connector-kinds.ts`, `connector-icons.ts` | 20 min |
| Rename `addCableAndPersist` → `addCable` | `CableContext.tsx`, `AppContext.tsx`, all callers | 15 min |

---

### Phase 2 — Extract Service Layer

#### 2.1 `IdGenerator` service
- **Create** `src/lib/idGenerator.ts`
```typescript
export class IdGenerator {
  constructor(prefix?: string)
  next(): string
  initFromObjects(objects: CanvasObjectType[]): void
}
```
- **Remove** module-level `nextObjectId` / `idPrefix` from `templateHelpers.ts`
- Expose instance from `BoardContext` or `AppContext`

#### 2.2 `TemplateService`
- **Create** `src/lib/templateService.ts`
```typescript
export class TemplateService {
  constructor(devices: DeviceTemplate[], boards: BoardTemplate[])
  getDimensions(templateId?: string): [w, d, h] | null
  getImage(templateId?: string): string | null
  getShape(templateId?: string): Shape3D | undefined
  hasKnownTemplate(templateId?: string): boolean
}
```
- Move template-authority rule out of `objectDimensions.ts` into `TemplateService.getDimensions`
- Update `snapToBoundingBox.ts` to accept `TemplateService` instead of a raw callback

#### 2.3 Decompose `stateSerialization.ts`
- `parseSavedState(json: string): unknown`
- `validateSavedState(data: unknown): SavedState | null`
- `enrichObjectsWithTemplates(objects, ts: TemplateService): CanvasObjectType[]`
- `stateSerialization.runtime.ts` composes these with runtime templates

#### 2.4 `catalogFilters.ts` pure utility
- **Create** `src/lib/catalogFilters.ts` with pure functions
- `useBoardDeviceFilters.ts` becomes state-only: manages filter values, delegates computation
- `CatalogContext.tsx`: replace `ReturnType<typeof useBoardDeviceFilters>` with explicit `CatalogFilters` interface

---

### Phase 3 — Context Layer Fixes

#### 3.1 ConfirmationContext
- Remove portal rendering from provider
- **Create** `src/components/common/ConfirmationDialogPortal.tsx` (rendered once in `App.tsx`)
- `ConfirmationContext` provides API only

#### 3.2 Split UiContext
- Keep in `UiContext`: grid, labels, xray, unit, background, sidebar state
- Move to new `RenderingContext`: mini3d variants, cableLayer, lineRuler
- Update `AppContext.tsx` provider stack and all consumers

#### 3.3 Harden CatalogContext typing
- Define `interface CatalogFilters` explicitly
- Replace `ReturnType<...>` with it

#### 3.4 Slim down AppContext *(largest task)*
Target: ~100-line provider compositor, zero business logic.

| Current responsibility | Move to |
|------------------------|---------|
| UI toggles | `UiContext` (already there, stop re-implementing) |
| Board ops (delete, rotate, order) | `BoardContext` handlers |
| `centerView()` | `CanvasContext.centerOnObjects()` |
| `getPlacementInVisibleViewport()` | `placementStrategy.ts` (already exists) |
| Template resolution on add | `TemplateService` (Phase 2) |
| Catalog handlers | `CatalogContext` |
| Drag coordination | `InteractionContext` (Phase 4) |
| `useBoardPersistence` params | Collapse to `BoardSnapshot` + `applySnapshot()` |

---

### Phase 4 — Hook Decomposition

#### 4.1 Split `useCanvasZoomPan` (370 lines)
- `src/hooks/useZoom.ts` — math + clamp + apply
- `src/hooks/usePan.ts` — pan tracking + movement
- `src/hooks/useWheelZoom.ts` — wheel event + throttle
- `src/hooks/usePinchZoom.ts` — touch pinch + two-finger pan
- `src/hooks/useSpaceKey.ts` — space → pan mode
- `useCanvasZoomPan.ts` becomes compositor of these 5

#### 4.2 `useCablePhysics` — decouple sim from publishing
- **Create** `src/lib/cablePhysics.ts` — pure Verlet simulation, no React
- `useCablePhysics.ts` runs rAF loop; calls `setPoints()` only when delta > threshold

#### 4.3 `useDragState` — remove history concern
- Delete `hasPushedHistory` flag
- Callers (`useObjectDrag`, `useCableDrag`) call `pushHistory()` at their own discretion

#### 4.4 `SelectionContext`
- **Create** `src/context/SelectionContext.tsx`
- API: `selectedIds: Set<string>`, `select()`, `deselect()`, `clearSelection()`, `toggleSelection()`
- `useCanvasInteractions.ts` reads from it; doesn't own selection state

#### 4.5 `InteractionContext`
- **Create** `src/context/InteractionContext.tsx`
- Explicit registry for drag handler bindings
- Eliminates the late-binding `setHandlers` useEffect in `AppContext.tsx`

---

## New Files Summary

```
src/lib/
  idGenerator.ts          ← ID generation service (replaces globals in templateHelpers)
  templateService.ts      ← Template lookup + authority business rule
  catalogFilters.ts       ← Pure filter computation functions
  cablePhysics.ts         ← Pure Verlet sim (extracted from useCablePhysics)

src/constants/
  device-dimensions.ts    ← Shared WDH_COMPACT, WDH_200, etc.
  connector-kinds.ts      ← ConnectorKind, CONNECTOR_NAME_OPTIONS
  connector-icons.ts      ← CONNECTOR_ICON_MAP (icon paths)

src/context/
  SelectionContext.tsx     ← selectedIds state
  InteractionContext.tsx  ← drag handler registry
  RenderingContext.tsx    ← mini3d + cable layer + line ruler flags

src/components/common/
  ConfirmationDialogPortal.tsx  ← portal rendering extracted from ConfirmationContext

src/hooks/
  useZoom.ts
  usePan.ts
  useWheelZoom.ts
  usePinchZoom.ts
  useSpaceKey.ts
```

---

## Verification

After each phase:
1. `npx tsc --noEmit --pretty` — zero errors
2. `npx vitest run` — all tests green
3. Manual smoke test: drag objects, add cables, undo/redo, save/load board, 3D view, catalog filter, resize window
