# T-262 - Realize Typed Recurse Policy And Runtime

- id: T-262
- title: Repair typed recurse parent-rebind admission
- type: bug
- ticket_category: ordinary
- status: completed
- phase_status: closed_after_external_reverification
- implementation_status: repaired_checkpoint
- proof_status: focused_passed
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Replace the unconditional parent-rebind admission with a deterministic
    cross-check over exact admitted foldback, next-input, policy, budget,
    lineage, and preserved-evidence truth before another recursive effect.
- change_class: realization_refactor
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    typed_recurse_runtime.ts parent-stage admission
- triaged_at: 2026-07-14
- created_at: 2026-07-13
- updated_at: 2026-07-14
- reopened_at: 2026-07-14
- delivery_phase: DS-3
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- source_ticket: T-252
- dependency: T-261
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md
- design_decision: >-
    .ai-workspace/comments/codex/
    20260713T201300Z_DECISION_delegated_fh_accept_t262_design.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T205500Z_SELF_REVIEW_t262_typed_recurse_runtime.md
- final_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T205700Z_DECISION_delegated_fh_accept_and_close_t262.md
- review_status: externally_verified_and_accepted
- implementation_commit: 7a9cfb01
- repair_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T020153Z_SELF_REVIEW_t262_parent_rebind_repair.md
- external_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T031000Z_REVIEW_GATE_t262_external_acceptance.md
- closure_decision_ref: >-
    .ai-workspace/comments/codex/
    20260714T031200Z_DECISION_close_t262_after_external_acceptance.md
- closed_at: 2026-07-14

## Boundary

Close `typed_recurse_policy_and_runtime`: structural recursion joins a positive
policy budget, termination evaluator, foldback contract, rebind input, parent
evaluation, lineage, and continuation truth.

## T-252 Census Gap Ownership

- gap_family: typed_recurse_policy_and_runtime

## Entry And Exit

Accept a three-view generic design before code. The unchanged T-252 body must
recurse only from its post-submitter typed disposition, stop on closed/F_H/
blocked/budget truth, and preserve prior-round evidence. Prove a non-Consensus
recursive GraphFunction.

## Non-Closure

C.retry as a semantic round, hard-coded hidden budget, name-only recurse,
imperative loop, or foldback without exact admitted rebind material.

## Current Disposition

`closed_after_external_reverification`. The structural compiler, budget,
termination, foldback, and replay boundaries remain retained. The repaired
parent stage independently derives and verifies the exact rebind witness before
another recursive effect. The former disposition follows as superseded
evidence.

One direct recurse application lowers to a typed
structural relation and binds the exact selected Module, catalog entry, wrapper,
operand, input/output contracts, termination evaluator, foldback relation,
parent rebind, lineage, admitted positive budget, and policy.

Replay owns application ordinals, fresh child identities, stage resumption,
causation, budget exhaustion, terminal projection, and prior-evidence
preservation. Each child result, termination decision, foldback output, and
parent rebind is admitted before it can influence the next application.
Malformed foldback and other terminal failures are persisted so replay cannot
repeat an effect.

Nested, mixed, and mutual recursion remain typed gaps. Traversal conservation
and tenant conformance remain owned by T-267 and T-268, and public effects stay
startup-blocked until those authorities close.

## Closure Evidence

The evidence below is historical and no longer closes this ticket. A new
negative must inject a mismatched next payload or evidence basis through the
live foldback path and observe deterministic rejection before round two.

- implementation checkpoint: `e09d3b65`
- full semantic suite: 1679/1679
- focused T-262 lane: 42/42; packed public API proof 1/1; GTL law 82/82
- source-blind T-223 suite: 70/70
- T-250 version-basis and documentation drift: 13/13
- T-252 body/probe: 11/11; unchanged body digest and two successor gaps
- post-closure T-252 ownership manifest:
  `sha256:96b6f53d721444d6ab3622743fd59ed129981c0c0df079a9f532cf83444f9085`;
  zero unowned, duplicate, or active-owned-but-unobserved families
- semantic lint and `git diff --check`: passed
- Mermaid design gate: 39 diagrams across 13 files
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1109 immutable payload files

## Repair Evidence

- the foldback adapter must provide a content-derived witness binding the exact
  child output, proposed next input, foldback declaration digest, policy,
  budget, lineage, and preserved evidence;
- the parent stage independently re-derives that witness from admitted event
  truth and emits `blocked` before round two when it is absent or stale;
- replay rejects an admitted parent event whose foldback lacks that exact
  witness;
- a live negative injects an unrelated payload with generic evidence and
  observes one child call, `parent_rebind_blocked`, and no round-two effect;
- focused T-262 tests: 10/10;
- adjacent T-252/T-255/T-262 lane: 42/42;
- packed M03 proof: 1/1;
- GTL law: 82/82;
- `git diff --check`: passed.

The independent review accepted this repair as proportional to the trusted-
desktop threat model and confirmed that the live negative rejects the forged
next payload before round two. The fresh full semantic lane passed 1696/1696.
