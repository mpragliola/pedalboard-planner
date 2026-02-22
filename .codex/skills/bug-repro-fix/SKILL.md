---
name: bug-repro-fix
description: Use for bug fixes where reproduction is uncertain or regressions are likely; enforce repro-first workflow.
---

# Bug Repro Fix

## Workflow
1. Capture bug report as concrete steps and expected/actual behavior.
2. Reproduce with a failing test or deterministic script.
3. Patch only after repro is stable.
4. Keep fix minimal and local to root cause.
5. Verify failing case now passes and nearby cases remain stable.

## Guardrails
- Avoid speculative rewrites without reproduction.
- Do not bundle unrelated refactors in the same fix.
- Record assumptions if exact reproduction is incomplete.

## Output expectation
- Repro steps
- root cause
- minimal patch
- proof (test or deterministic verification)
