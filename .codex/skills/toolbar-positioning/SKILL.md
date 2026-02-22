---
name: toolbar-positioning
description: Use when changing floating toolbar placement, viewport clamping, or anchor-position geometry.
---

# Toolbar Positioning

## Scope
- `src/lib/toolbarPosition.ts`
- `src/components/selection/SelectionToolbar.tsx`
- `src/components/selection/CableToolbar.tsx`
- related tests in `src/lib/toolbarPosition.test.ts`

## Workflow
1. Keep placement math pure and deterministic.
2. Normalize constants through shared layout config where appropriate.
3. Verify off-screen and near-edge cases with tests.
4. Ensure rotation and bounds center assumptions are explicit.

## Guardrails
- Avoid re-implementing existing geometry helpers.
- Avoid hardcoded duplicate constants in components.
- Keep calculations free of DOM side effects.

## Required test cases
- center placement
- top-edge clamp
- left-edge clamp
- right-edge clamp
- no-bounds fallback
