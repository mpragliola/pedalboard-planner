---
name: modal-flow-safety
description: Use when editing modal open/close flows, focus behavior, escape handling, or portal layering.
---

# Modal Flow Safety

## Scope
- modal components and portal roots
- open state orchestration in canvas/menu layers

## Workflow
1. Enumerate all modal open states that can coexist.
2. Ensure only intended modal combinations are possible.
3. Verify Escape and backdrop behavior closes the correct target.
4. Validate focus and return-focus behavior after close.
5. Add regression tests for stacking/conflict cases.

## Guardrails
- Avoid independent booleans that allow accidental modal stacking.
- Prefer shared modal primitives for lifecycle consistency.
- Keep close semantics consistent across modal variants.
