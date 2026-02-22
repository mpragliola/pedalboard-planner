---
name: gesture-change
description: Use when implementing or refactoring pointer, pinch, wheel, or coordinator gesture logic.
---

# Gesture Change

## Scope
Files often involved:
- `src/hooks/useCanvasGestureCoordinator.ts`
- `src/hooks/canvasZoomPan/pointerPanStateMachine.ts`
- `src/hooks/canvasZoomPan/usePointerCanvasPan.ts`
- `src/hooks/canvasZoomPan/touchGestureStateMachine.ts`

## Workflow
1. Identify active gesture owner and competing handlers.
2. Preserve allowed mode union names.
3. Ensure every successful mode request has a release path.
4. Verify cancel, blur, unmount, and pointer-loss cleanup paths.
5. Add or update tests for ownership transitions.

## Guardrails
- Do not read live mode with ad-hoc render polling.
- Do not add a new mode name without updating coordinator unions and tests.
- Avoid duplicate gesture recognizers for the same pointer sequence.

## Done criteria
- No leaked mode ownership.
- No stale pointerId after cancellation.
- Tests cover acquire, reject, release, and conflict cases.
