---
name: release-quality-gate
description: Use before release or merge-to-main to run quality gates and summarize ship risk.
---

# Release Quality Gate

## Workflow
1. Run type check and test suite.
2. Scan changed files for anti-patterns in gesture/history/serialization.
3. Confirm no obvious performance regression in hot paths.
4. Summarize pass/fail status and residual risks.

## Commands
- `npx tsc --noEmit --pretty`
- `npx vitest run`

## Output format
- Gate status: pass/fail
- Failing checks with file references
- Risks accepted for release
- Follow-ups required after release
