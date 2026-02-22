---
name: template-factory-change
description: Use when editing template helper factories, custom object creation, or template compatibility behavior.
---

# Template Factory Change

## Scope
- `src/lib/templateHelpers.ts`
- related template registries and serializers

## Workflow
1. Confirm object shape contract before editing factory outputs.
2. Preserve stable `templateId` values used by persisted data.
3. Prefer one canonical factory path over duplicate wrappers.
4. Update tests for custom board/device object generation.

## Guardrails
- Do not detect custom objects with `id` prefix heuristics.
- Do not break localStorage payload compatibility.
- Keep output types aligned with `DeviceTemplate` and board object contracts.

## Regression checks
- Existing saved data still loads.
- Custom board and custom device both serialize/deserialize correctly.
