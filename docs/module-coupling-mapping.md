# Module Coupling Mapping

_Generated on 2026-02-18 from `src/**/*.ts(x)`._

## Scope and Method

- Static import analysis (`from "..."`) across TypeScript/TSX files under `src/`.
- Relative imports are resolved to real files (`.ts`, `.tsx`, `index.ts`, `index.tsx`).
- Domains are grouped by top-level folder in `src/`: `data`, `lib`, `hooks`, `context`, `components`, `constants`, `test`, and `root` (top-level files like `src/App.tsx`).

## High-Level Stats

| Metric | Value |
|---|---:|
| TS/TSX files analyzed | 207 |
| Total import statements | 692 |
| Internal resolved imports | 569 |
| External package imports | 123 |
| Unresolved relative imports | 0 |

## Files per Domain

| Domain | Files |
|---|---:|
| `data` | 81 |
| `components` | 43 |
| `lib` | 40 |
| `hooks` | 19 |
| `context` | 13 |
| `root` | 8 |
| `constants` | 2 |
| `test` | 1 |

## Domain Dependency Matrix (Internal Imports)

| From \ To | `components` | `constants` | `context` | `data` | `hooks` | `lib` | `root` | `test` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `components` | 51 | 7 | 43 | 2 | 15 | 34 | 25 | 0 |
| `constants` | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| `context` | 2 | 2 | 12 | 2 | 8 | 9 | 5 | 0 |
| `data` | 0 | 0 | 0 | 203 | 0 | 2 | 30 | 0 |
| `hooks` | 0 | 0 | 0 | 2 | 8 | 16 | 5 | 0 |
| `lib` | 0 | 1 | 0 | 5 | 0 | 39 | 15 | 0 |
| `root` | 9 | 2 | 5 | 3 | 0 | 1 | 5 | 0 |
| `test` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Cross-Domain Coupling Edges

| Edge | Count |
|---|---:|
| `components -> context` | 43 |
| `components -> lib` | 34 |
| `data -> root` | 30 |
| `components -> root` | 25 |
| `hooks -> lib` | 16 |
| `lib -> root` | 15 |
| `components -> hooks` | 15 |
| `root -> components` | 9 |
| `context -> lib` | 9 |
| `context -> hooks` | 8 |
| `components -> constants` | 7 |
| `root -> context` | 5 |
| `context -> root` | 5 |
| `hooks -> root` | 5 |
| `lib -> data` | 5 |
| `root -> data` | 3 |
| `root -> constants` | 2 |
| `context -> data` | 2 |
| `context -> constants` | 2 |
| `context -> components` | 2 |
| `data -> lib` | 2 |
| `hooks -> data` | 2 |
| `components -> data` | 2 |
| `root -> lib` | 1 |
| `constants -> root` | 1 |
| `lib -> constants` | 1 |

## Hotspots: Highest Outgoing Internal Dependencies

| File | Internal imports |
|---|---:|
| `src/data/devices.ts` | 50 |
| `src/data/boards.ts` | 30 |
| `src/context/AppContext.tsx` | 26 |
| `src/components/Canvas.tsx` | 16 |
| `src/App.tsx` | 14 |
| `src/components/cable/CableLayerOverlay.tsx` | 14 |
| `src/components/cable/CablePaths.tsx` | 13 |
| `src/components/catalog/DropdownsPanel.tsx` | 12 |
| `src/components/mini3d/sceneLayout.ts` | 9 |
| `src/components/componentlist/ComponentListModal.tsx` | 8 |
| `src/components/mini3d/Mini3DOverlay.tsx` | 8 |
| `src/components/cable/AddCableModal.tsx` | 7 |
| `src/components/ruler/LineRulerOverlay.tsx` | 7 |
| `src/components/selection/SelectionInfoPopup.tsx` | 7 |
| `src/lib/objectDimensions.ts` | 6 |
| `src/lib/templateHelpers.ts` | 6 |
| `src/components/boardmenu/BoardMenu.tsx` | 6 |
| `src/components/gpt/GptModal.tsx` | 6 |
| `src/constants.ts` | 5 |
| `src/context/AppProviders.tsx` | 5 |

## Hubs: Highest Incoming Internal Dependencies

| File | Internal dependents (approx) |
|---|---:|
| `src/data/devices.ts` | 57 |
| `src/data/deviceHelpers.ts` | 48 |
| `src/data/boards.ts` | 35 |
| `src/lib/vector.ts` | 31 |
| `src/types.ts` | 26 |
| `src/wdh.ts` | 23 |
| `src/constants.ts` | 22 |
| `src/shape3d.ts` | 14 |
| `src/context/UiContext.tsx` | 12 |
| `src/context/CanvasContext.tsx` | 9 |
| `src/lib/objectDimensions.ts` | 9 |
| `src/context/CableContext.tsx` | 8 |
| `src/context/BoardContext.tsx` | 8 |
| `src/constants/backgrounds.ts` | 7 |
| `src/lib/stateSerialization.ts` | 6 |
| `src/lib/math.ts` | 6 |
| `src/lib/rulerFormat.ts` | 6 |
| `src/context/CatalogContext.tsx` | 5 |
| `src/constants/cables.ts` | 5 |
| `src/lib/geometry.ts` | 5 |

## Files with Most Total Imports (Internal + External)

| File | Import statements |
|---|---:|
| `src/data/devices.ts` | 50 |
| `src/data/boards.ts` | 30 |
| `src/context/AppContext.tsx` | 27 |
| `src/components/Canvas.tsx` | 18 |
| `src/App.tsx` | 17 |
| `src/components/cable/CableLayerOverlay.tsx` | 15 |
| `src/components/cable/CablePaths.tsx` | 14 |
| `src/components/catalog/DropdownsPanel.tsx` | 13 |
| `src/components/componentlist/ComponentListModal.tsx` | 12 |
| `src/components/mini3d/Mini3DOverlay.tsx` | 12 |
| `src/components/boardmenu/BoardMenu.tsx` | 10 |
| `src/components/cable/AddCableModal.tsx` | 9 |
| `src/components/mini3d/sceneLayout.ts` | 9 |
| `src/components/catalog/CatalogList.tsx` | 8 |
| `src/components/gpt/GptModal.tsx` | 8 |
| `src/components/mini3d/AnimatedSceneBox.tsx` | 8 |
| `src/components/mini3d/Mini3DRootScene.tsx` | 8 |
| `src/components/ruler/LineRulerOverlay.tsx` | 8 |
| `src/components/selection/SelectionInfoPopup.tsx` | 8 |
| `src/components/catalog/CatalogDndProvider.tsx` | 7 |

## Quick Observations

- `data` is the largest and most internally-coupled domain (brand/template aggregation).
- `components` has high internal coupling and is expected to remain app-local unless a design-system effort is intentional.
- `lib` and `hooks` are smaller, clearer seams; these are the strongest package extraction candidates.
- Top-level orchestrators (`src/context/AppContext.tsx`, `src/App.tsx`) are integration points and should generally not be packaged directly.

## Constants Boundary Update (2026-02-18)

- Constants were split from the `src/constants.ts` umbrella into domain modules.
- Runtime consumers now import domain constants directly; the umbrella remains as a compatibility façade.

| Module | Boundary |
|---|---|
| `src/constants/runtime.ts` | Environment/runtime-derived values (`BASE_URL`, feature flags). |
| `src/constants/interaction.ts` | Input/zoom/timing/history values used by hooks/context. |
| `src/constants/layout.ts` | Canvas/UI placement and sizing constants. |
| `src/constants/catalog.ts` | Catalog sorting/grouping constants for device types. |
| `src/constants/defaults.ts` | Default initial state/object fallback values. |
| `src/constants/connectors.ts` | Connector icon/name/kind definitions. |
| `src/constants.ts` | Compatibility-only barrel re-exporting domain constants. |

### Migration status

- Remaining import from `./constants`: `src/constants.test.ts` (intentional compatibility test).
- No runtime module currently imports `../constants` after migration.

### Boundary guidance

- Prefer direct imports from `src/constants/*` for new code.
- Keep `src/constants.ts` for backward compatibility only; avoid adding new direct consumers.
