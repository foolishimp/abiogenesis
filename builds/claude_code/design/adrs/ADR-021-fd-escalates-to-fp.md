# ADR-021: F_D Evaluator Findings Escalate to F_P

**Status**: Accepted (supersedes ADR-014)
**Date**: 2026-03-23
**Implements**: REQ-F-GATE-002
**Restores alignment with**: INT-001 (capability escalation ladder)

## Context

ADR-014 (2026-03-16) introduced the rule that F_D failure blocks F_P dispatch. This contradicted INT-001's escalation model — the intent describes F_D → F_P as capability escalation ("deterministic blocked → agent explores"), not as a gate where deterministic failure prevents agent work.

In practice, F_D failures on cold start (missing files, missing tags, incomplete artifacts) are the normal reason to invoke F_P. Gating F_P on F_D collapsed the agent into a shallow post-processing role over already-valid state, breaking the auto-loop on every cold start and forcing unnecessary human intervention.

The phrase "broken deterministic state" in ADR-014 was the doctrinal error. In construction work, a broken deterministic state is often precisely why escalation is needed.

## Decision

F_D runs first; unresolved deterministic deficits escalate to F_P; unresolved judgment escalates to F_H.

Specifically:

1. **F_D is first-pass capability.** It resolves what deterministic machinery can resolve cheaply and safely.

2. **F_D evaluator failure on edges with unresolved F_P is an escalation trigger, not a stop condition.** Deterministic findings describe the problem surface to F_P. The F_P manifest carries `fd_results` so the agent knows what to fix.

3. **F_P is the constructive layer.** It may build, repair, synthesize, and review where deterministic capability is insufficient.

4. **F_H is the judgment layer.** It handles policy, tradeoffs, acceptance, and ambiguity that remains after F_P. F_H still requires both F_D and F_P to pass.

5. **Only fatal engine/runtime failures halt escalation.** Fatal means: context integrity violations (digest mismatch), malformed runtime/config state, impossible command/runtime failures. Missing upstream artifacts (e.g., no `code/` directory on cold start) are ordinary unconverged state — not fatal.

## Event Kind Split

The `found` event gains a second kind discriminator:

- `found{kind: fd_findings}` — F_D findings carried into F_P escalation (observational, accompanies `fp_dispatched`)
- `found{kind: fd_gap}` — terminal deterministic gap: no F_P on this edge, or F_P certified but F_D still red (construction quality problem)

## What This Supersedes

ADR-014 stated: "F_P is invoked only when F_D is exhausted" and "dispatching agent work against a broken deterministic state wastes budget." Both claims are wrong for the capability model. F_P's value is discovery, repair, synthesis, and navigation of ambiguity — not post-processing of already-valid state.

## What Is Preserved

- F_H gate unchanged: requires both F_D and F_P to pass before `fh_gate_pending`
- Pending dispatch deduplication: `_find_pending_dispatch()` prevents duplicate F_P dispatch
- Construction quality signal: F_D failing after F_P certified → `fd_gap` (the F_P work was insufficient)

## Consequences

- F_P is dispatched on cold start when F_D finds gaps — the auto-loop works as intended
- The F_P manifest includes F_D findings — the agent can address everything in one pass
- Domain graphs (GSDLC, etc.) no longer need workarounds for the gate semantics
- The engine aligns with INT-001's escalation model

## Implementation

`schedule.py` `iterate()`:
- Emit `found{kind: fd_findings}` before F_P dispatch when both are failing
- Remove `not fd_failing` guard from F_P dispatch condition

`commands.py` `gen_iterate()`:
- Remove the `fd_gap` early return block that prevented manifest creation
- Preserve pending dispatch check

`commands.py` `gen_start()`:
- Auto-loop stops on `fd_gap` only (terminal), not `fd_findings` (escalation)
