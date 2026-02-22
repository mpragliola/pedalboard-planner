---
name: vitest-targeted-tests
description: Use when adding focused tests for changed logic, especially state machines, pure utilities, and edge-case regressions.
---

# Vitest Targeted Tests

## Workflow
1. Write tests nearest to changed behavior.
2. Cover one success path plus edge/failure paths.
3. Use explicit behavior assertions, not implementation snapshots.
4. Keep setup helpers minimal and reusable.
5. Run targeted tests first, then broader suite if needed.

## Patterns
- State machines: assert transition + side effects.
- Pure utils: table-driven cases for edge values.
- Hooks: assert observable output, not internal refs.

## Guardrails
- Avoid brittle timing assertions when a deterministic trigger exists.
- Do not duplicate fixtures with tiny variation; parameterize cases.
