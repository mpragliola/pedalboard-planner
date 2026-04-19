# Pedal Planner — Claude Code Instructions

## Environment
- React 18 + TypeScript + Vite
- Type check: `npx tsc --noEmit --pretty`
- Tests: `npx vitest run`
- Windows host, bash shell — use Unix paths and `rm` not `del`

## Architecture at a Glance

| File | Role | Pattern |
|------|------|---------|
| `src/context/AppContext.tsx` | Central hub | Provider Orchestrator → 7 split contexts |
| `src/hooks/useCanvasGestureCoordinator.ts` | Gesture mode arbitration | Observer + State Machine |
| `src/hooks/useCanvasInteractionOrchestrator.ts` | Pointer/drag/cable routing | Mediator |
| `src/context/boardStateCommands.ts` | Reversible operations | Command Pattern |
| `src/hooks/useHistory.ts` | Undo/redo engine | Command + Snapshot hybrid |
| `src/hooks/canvasZoomPan/pointerPanStateMachine.ts` | Pan state | Explicit State Machine |
| `src/hooks/canvasZoomPan/touchGestureStateMachine.ts` | Pinch state | Explicit State Machine |
| `src/lib/snapStrategies.ts` | Snap behavior composition | Strategy Pattern |
| `src/lib/toolbarPosition.ts` | Toolbar placement | Pure function |
| `src/lib/templateHelpers.ts` | Object creation | Factory |
| `src/lib/geometry.ts` | Geometry utilities | Pure functions |

Consumers use specific hooks (`useBoard()`, `useCanvas()`, etc.) — never import AppContext directly.

## Anti-Patterns — Do Not Do These

### History / Undo
- **Never** push `{ state: fullBoardState }` snapshots for recordable actions — use command factories in `boardStateCommands.ts` that capture only deltas
- **Never** call `setState()` directly for actions that should be undoable — wrap in `executeBoardCommand()`

### Gesture Coordination
- **Never** assume gesture mode ownership — always call `gesture.requestMode()` and check the return value
- **Never** call `gesture.getMode()` inside a render — use `gesture.subscribe()` / `subscribeType()` for observers
- **Never** invent new mode names — use the defined union: `"idle" | "pointer-pan" | "pinch-pan" | "cable-draw" | "modal-open"`
- **Always** pair `requestMode()` with `releaseMode()` — never hold a mode indefinitely

### Pointer / Event Handling
- **Never** respond to all pointer moves without checking pointerId ownership — use state machine guards
- **Never** call context hooks inside event handlers — read values at component top level and capture in refs if needed for callbacks

### Cable Snap
- **Never** hardcode snap logic into components — compose strategies from `snapStrategies.ts`
- **Never** create new strategy instances inside render — memoize with `useMemo`
- **Always** account for object rotation when computing AABB bounds

### Object / State Mutations
- **Never** mutate arrays or objects in place during state updates — use `{ ...obj }`, `array.slice()`, etc.
- **Never** detect custom objects with `id.startsWith(...)` — use `templateId === "board-custom"` or `"device-custom"`

### Coordinate System
- `1mm = 1px` (MM_TO_PX = 1) — do not introduce conversion factors
- `clientToCanvas` lives in `useCanvasCoords` hook — do not reimplement it inline

### Misc
- **Never** hardcode snap tolerance, double-tap threshold, gap, or similar tunables directly in logic — pass as parameters or read from config
- **Never** break existing localStorage compatibility — keep original `templateId` values in templates
- Brand device files export `BRAND_DEVICE_TEMPLATES: DeviceTemplate[]` — follow that shape exactly

## Update policy

- Whenever any implementation alters the UI in a significant way for the user, the screenshot pipeline must be updated
- Evaluate for any implementation if we need to alter, remove or add use cases for unit test and e2e tests.
