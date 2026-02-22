---
name: perf-hotpath-pass
description: Use when optimizing render/event hot paths, repeated linear scans, and avoidable allocations.
---

# Perf Hotpath Pass

## Workflow
1. Run `scripts/find_linear_scans.sh` to find suspicious `.find/.filter/.some` patterns.
2. Review hot files for repeated scans in render and pointer handlers.
3. Replace repeated scans with memoized lookup maps or cached derivations.
4. Validate behavior remains unchanged with tests.

## Load references when needed
- Read `references/hotpath-checks.md` for common remediation patterns.

## Guardrails
- Do not over-memoize tiny code paths without evidence.
- Prioritize high-frequency handlers and render loops.
- Preserve readability; document non-obvious caching decisions.
