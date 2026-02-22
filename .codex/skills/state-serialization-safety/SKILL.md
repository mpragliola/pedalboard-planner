---
name: state-serialization-safety
description: Use when editing state serialization/deserialization, storage schemas, or migration logic.
---

# State Serialization Safety

## Scope
- `src/lib/stateSerialization.ts`
- any storage migration helpers and schema constants

## Workflow
1. Identify persisted fields and compatibility constraints.
2. Make changes backward compatible where possible.
3. If migration is required, add explicit migration logic.
4. Add round-trip tests for old and new payloads.

## Guardrails
- Do not silently drop unknown fields without intent.
- Preserve stable identifiers used in templates and objects.
- Keep parser failure paths explicit and safe.

## Required tests
- deserialize legacy sample
- serialize new sample
- deserialize(serialize(x)) round trip
