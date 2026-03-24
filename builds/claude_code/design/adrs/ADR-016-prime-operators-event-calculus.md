# ADR-016: Prime Operators and Event Calculus Foundation

**Status**: Accepted
**Date**: 2026-03-20
**Implements**: REQ-F-EC-001, REQ-F-EC-002, REQ-F-EC-003, REQ-F-EC-004, REQ-F-EC-005, REQ-F-EC-006, REQ-F-EVAL-004, REQ-F-EVAL-005
**Supersedes**: Informal event naming in ADR-005, ADR-008, ADR-011
**Derives from**: 20260320T020432_STRATEGY_prime-operator-refactor-plan.md, Codex reviews on ontology/scope/EC consistency

## Decision

The engine event schema is grounded in Event Calculus with five prime operators and a clean-start migration. All convergence-gating queries are either `holdsAt` projections on two fluents, or live F_D execution.

### Five Prime Operators

| Operator | `kind` discriminator | EC role |
|----------|---------------------|---------|
| `found` | `fd_gap` | `happensAt` only — audit record of F_D observation |
| `approved` | `fh_review`, `fh_intent` | `initiates operative(edge, work_key, wv)` |
| `assessed` | `fp` (pass/fail), `fh_review` (reject) | `initiates certified(edge, work_key, ev, spec_hash, wv)` when `kind: fp, result: pass`; `happensAt` only for `fh_review` rejection |
| `revoked` | `fh_approval`, `fp_assessment` | `terminates operative(edge, work_key, wv)` or `terminates certified(edge, work_key, ev, spec_hash, wv)` |
| `intent_raised` | (unchanged) | `happensAt` only — homeostasis signal |

### Two Fluents

| Fluent | Initiated by | Terminated by | Shadowed by |
|--------|-------------|---------------|-------------|
| `operative(edge, work_key, wv)` | `approved{kind: fh_review\|fh_intent}` | `revoked{kind: fh_approval}` | — (not affected by reset) |
| `certified(edge, work_key, evaluator, spec_hash, wv)` | `assessed{kind: fp, result: pass}` | `revoked{kind: fp_assessment}` or spec_hash mismatch | `reset` boundary (ADR-026) |

`work_key` is included in both fluents (REQ-F-WK-003). **Degenerate case:** when `work_key` is absent, fluents are scoped by `(edge, wv)` alone.

No others. F_D has no fluent — it re-runs its command on every iteration.

**Symmetric termination invariant**: Both fluents support explicit event-calculus termination via `revoked`. The F_ algebra requires symmetric `{initiate, terminate, query}` operations across all functor types. Spec_hash mismatch remains as an *additional* termination mechanism for `certified` (identity change invalidates the fluent), but it does not replace explicit revocation.

### Rename Mapping

| Before | After | Payload change |
|--------|-------|---------------|
| `fd_gap_found` | `found` | add `kind: fd_gap` |
| `review_approved` | `approved` | add `kind: fh_review` |
| `fp_assessment` | `assessed` | add `kind: fp` |
| `review_rejected` | `assessed` | `kind: fh_review, result: reject` |
| *(new)* | `revoked` | `kind: fh_approval` or `kind: fp_assessment` + scope fields |
| `intent_raised` | `intent_raised` | unchanged |

Tier 2 events and Tier 3 events do not participate in EC fluent initiation or termination. See the Three-Tier Event Taxonomy below for the full illustrative registry. `reset` is a Tier 2 control event that creates a certification boundary (ADR-026) — it shadows F_P certifications without terminating fluents.

## Problem

The engine used implementation-specific event names (`review_approved`, `fp_assessment`, `fd_gap_found`) with no formal relationship to the consciousness-loop operators they represent. This caused:

1. **No revocation** — once `review_approved` was emitted, there was no way to withdraw it. The `operative` fluent was initiatable but not terminable.
2. **Schema collision** — F_H rejection had its own event type (`review_rejected`) rather than being an `assessed` outcome, creating a sixth event type for five logical operators.
3. **Implicit projection semantics** — the relationship between events and convergence state was scattered across `bind.py`, `schedule.py`, and `commands.py` with no formal model.

## Rationale

Event Calculus provides the formal model:

| EC Primitive | Meaning | Implementation |
|---|---|---|
| `happensAt(E, T)` | Event E occurred at time T | Line in `events.jsonl` with `event_type` and `event_time` |
| `initiates(E, F, T)` | Event E starts fluent F at time T | `approved` initiates `operative`; `assessed{fp, pass}` initiates `certified` |
| `terminates(E, F, T)` | Event E ends fluent F at time T | `revoked{fh_approval}` terminates `operative`; `revoked{fp_assessment}` terminates `certified`; spec_hash mismatch also terminates `certified` |
| `holdsAt(F, T)` | Fluent F is true at time T | Projection query in `bind_fh` and `_passes` |

The rename from implementation names to prime operators is a governance choice for conceptual cleanliness, not an EC requirement. EC lives in the projection rules (`initiates`, `terminates`, `holdsAt`), not in event names. The clean-start assumption eliminates migration cost, making the rename free.

### Three Convergence Models

| Evaluator type | Model | Query |
|---|---|---|
| F_D | Live execution | `run_fd_evaluator(ev) → passes` |
| F_H | Fluent projection | `holdsAt(operative(edge, work_key, wv), now)` — implemented in `bind_fh()` |
| F_P | Fluent projection | `holdsAt(certified(edge, work_key, ev, spec_hash, wv), now)` — projection observes both `revoked` termination and `reset` boundary shadowing (ADR-026) |

### F_D is Stateless

F_D evaluators re-run their command on every iteration. `found{kind: fd_gap}` is `happensAt`-only: it records the observation for audit but does not initiate or terminate any fluent and does not gate anything.

### Rejection vs Revocation

`assessed{kind: fh_review, result: reject}` (rejection) is a judgment on the current candidate — "this doesn't pass." It is `happensAt`-only; no fluent change.

`revoked{kind: fh_approval}` (revocation) withdraws previously granted authority — it terminates `operative(edge, wv)`. Different speech act, different EC consequence.

### Revocation Referent Contract

`revoked` terminates a **fluent**, not a specific event. Two kinds, symmetric across the two fluents:

```
terminates(revoked{kind: fh_approval, edge: E, wk: WK, wv: W}, operative(E, WK, W), T)
terminates(revoked{kind: fp_assessment, edge: E, wk: WK, wv: W}, certified(E, WK, *, *, W), T)
```

**`revoked{kind: fh_approval}`** — terminates `operative`. Scope fields: `kind` (required), `edge` (required), `work_key` (when present), `workflow_version` (scoped), `actor` (required), `reason` (required).

Projection: find latest `approved` at T_a; find any `revoked{kind: fh_approval}` at T_r > T_a with matching edge, work_key, and workflow_version; if found, fluent is terminated.

**`revoked{kind: fp_assessment}`** — terminates `certified`. Same scope fields. Projection: find latest `assessed{kind: fp, result: pass}` at T_a for the evaluator; find any `revoked{kind: fp_assessment}` at T_r > T_a with matching scope; if found, fluent is terminated.

The two revocation kinds are independent — revoking `fh_approval` does not affect `certified`, and vice versa.

**Legacy replay shim (superseded):** Wildcard `edge: "*"` was the V1 mechanism for broad revocation. Retained only for replaying existing event streams — not available for new work. V2 uses lineage-scoped compensation (ADR-026, REQ-F-CORRECT-001) or reset boundaries (ADR-026, REQ-F-CORRECT-002).

Re-approval/re-assessment after revocation: a later initiating event updates T_a, so the earlier revocation no longer postdates it.

**Symmetric invariant**: The F_ algebra requires that every functor type supports `{initiate, terminate, query}`. Spec_hash mismatch is an *additional* termination path for `certified` (identity-based), not a replacement for explicit event-calculus termination.

## Consequences

- Five event types with `kind` discriminator replace seven implementation-specific types
- All convergence logic reduces to two `holdsAt` queries plus live F_D execution
- `revoked` enables authority withdrawal — previously impossible
- Clean start: old `events.jsonl` archived, not rewritten. No backward-compat branches.
- `emit()` validates prime operators at the write primitive: `approved`/`revoked` require `kind`; `assessed{kind: fp}` requires `spec_hash`
- `_emit_event_cmd` validates full governance schemas per prime type
- Tier 2/3 events unchanged — only Tier 1 primes participate in EC projection

### Three-Layer Architecture

```
Layer 1: Event Calculus    — fluent truth over time (holdsAt, initiates, terminates)
         + F_D live eval   — stateless re-computation (no fluent)
         + reset boundary  — certification shadowing (ADR-026)
Layer 2: Scheduler rules   — WorkInstance dispatch, schedule.delta() convergence (ADR-024),
                             run governance (ADR-027), work-key scoping
Layer 3: Orchestrator      — resource allocation, parallelism, retry policy
```

ADR-016 originally changed only Layer 1. V2 (ADR-023 through ADR-027) extends all three layers while preserving the EC foundation.

### Migration

Clean-start epoch cutover per workspace:
1. Archive `events.jsonl` to `events.pre-v0.4.0.jsonl.archive`
2. Cascade install new engine + methodology
3. Fresh event log starts with `genesis_installed` + `workflow_activated`
4. All edges reopen — F_P re-assessment and F_H re-approval required

### Three-Tier Event Taxonomy

| Tier | Events | EC participation |
|------|--------|-----------------|
| 1 — Primes | `found`, `approved`, `assessed`, `revoked`, `intent_raised` | Fluent projection (or `happensAt` audit) |
| 2 — Control (illustrative, not exhaustive) | **Scheduler:** `edge_started`, `fp_dispatched`, `fh_gate_pending`, `edge_converged`. **Correction:** `reset`. **Refinement:** `work_spawned`, `zoomed`. **Run lifecycle:** `run_queued`, `run_started`, `run_dispatched`, `run_pending`, `run_assessed`, `run_failed`, `run_timed_out`, `run_superseded`. **Leaf lifecycle:** `leaf_task_started`, `leaf_task_completed`, `leaf_task_failed` | Scheduler bookkeeping, certification boundaries, observability — never initiate or terminate fluents |
| 3 — Lifecycle | `genesis_installed`, `genesis_sdlc_released`, `bug_fixed`, etc. | Infrastructure only |
