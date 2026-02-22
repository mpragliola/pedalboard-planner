# Hotpath Checks

## Typical hotspots
- Inline `.find()` in render for selected object lookup.
- Repeated array scans inside pointer move handlers.
- Recreating closures on every render for high-churn components.

## Preferred fixes
- Build `Map<string, T>` with `useMemo` for key-based lookups.
- Cache derived selections once per render.
- Move expensive geometry recomputations behind memoized inputs.

## Verify after optimization
- Behavior parity tests still pass.
- No stale cache on dependency changes.
