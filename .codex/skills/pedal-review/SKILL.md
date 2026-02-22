---
name: pedal-review
description: Use when the user asks for a review, risk scan, regression check, or quality audit of code changes.
---

# Pedal Review

## When to use
- User asks for a review.
- User asks what might break.
- Changes touch gesture, history, serialization, or modal code.

## Workflow
1. Gather changed files plus directly related dependencies.
2. Prioritize findings by severity.
3. Focus on correctness and regressions first, style second.
4. Include file and line for every finding.
5. Mention missing tests for each risky branch.

## Required checks
- Gesture ownership and mode release are balanced.
- Undoable edits go through command factories.
- PointerId ownership guards exist for move/up/cancel.
- Serialization changes preserve existing saved payloads.

## Output format
- Findings first, ordered high to low severity.
- Open questions and assumptions next.
- Brief summary last.
- If no findings, state that explicitly and list residual test gaps.
