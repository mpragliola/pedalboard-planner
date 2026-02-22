---
name: history-command-change
description: Use when adding or changing undoable state transitions, command factories, or history behavior.
---

# History Command Change

## Scope
Primary files:
- `src/context/boardStateCommands.ts`
- `src/hooks/useHistory.ts`
- relevant board/cable mutation call sites

## Workflow
1. Decide whether the action is recordable.
2. For recordable actions, create or update a command factory capturing deltas.
3. Route action through command execution path.
4. Keep snapshots only for non-recordable or explicit snapshot scenarios.
5. Add tests for do/undo/redo idempotence.

## Guardrails
- Do not call raw state setters for recordable actions.
- Do not push full-board snapshots for simple delta edits.
- Validate redo after multiple undo operations.

## Quick test matrix
- apply once
- undo once
- redo once
- apply twice then undo twice
- interleave with another command type
