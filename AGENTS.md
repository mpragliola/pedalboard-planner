# Pedal Planner - Agent Instructions

## Skills
A skill is a reusable instruction bundle in a `SKILL.md` file.

### Available skills
- pedal-review: Review-focused workflow for regressions, behavior risks, and missing tests. (file: .codex/skills/pedal-review/SKILL.md)
- gesture-change: Safe edit workflow for pointer/pinch/canvas gesture coordination. (file: .codex/skills/gesture-change/SKILL.md)
- history-command-change: Workflow for undoable state changes using command factories. (file: .codex/skills/history-command-change/SKILL.md)
- toolbar-positioning: Workflow for pure toolbar placement math and viewport clamping behavior. (file: .codex/skills/toolbar-positioning/SKILL.md)
- template-factory-change: Workflow for template helper and custom object factory edits with storage compatibility checks. (file: .codex/skills/template-factory-change/SKILL.md)
- vitest-targeted-tests: Write focused Vitest coverage with behavior-driven assertions. (file: .codex/skills/vitest-targeted-tests/SKILL.md)
- perf-hotpath-pass: Detect and patch hot-path inefficiencies in render/event loops. (file: .codex/skills/perf-hotpath-pass/SKILL.md)
- bug-repro-fix: Reproduce-first bug fixing workflow using a failing test before patching. (file: .codex/skills/bug-repro-fix/SKILL.md)
- architecture-adr-update: Record architecture decisions with concise ADR updates. (file: .codex/skills/architecture-adr-update/SKILL.md)
- modal-flow-safety: Prevent modal stacking, focus conflicts, and escape/backdrop regressions. (file: .codex/skills/modal-flow-safety/SKILL.md)
- state-serialization-safety: Safe serializer/deserializer edits with backward compatibility checks. (file: .codex/skills/state-serialization-safety/SKILL.md)
- release-quality-gate: Pre-release code quality and regression gate workflow. (file: .codex/skills/release-quality-gate/SKILL.md)

## How to use skills
- Trigger rules: Use a skill if the user names it directly (`$skill-name`) or the request clearly matches the skill description.
- Multiple skills: Use the smallest set of skills that covers the request.
- Progressive loading: Read only `SKILL.md` first, then load referenced files/scripts only if needed.
- Missing skill: If a skill file is missing, state it briefly and continue with the best fallback.

## Repo guardrails
- Type check with `npx tsc --noEmit --pretty`.
- Run tests with `npx vitest run`.
- Undoable actions should use command factories in `src/context/boardStateCommands.ts`.
- Gesture mode ownership should always pair `requestMode()` and `releaseMode()`.
- Keep `templateId` compatibility for serialized/localStorage data.
