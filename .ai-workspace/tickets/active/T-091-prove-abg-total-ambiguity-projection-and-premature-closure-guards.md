---
id: T-091
title: Prove ABG total ambiguity projection and premature closure guards
type: feature
ticket_category: implementation_migration
status: active
review_status: external_review_blockers_resolved_pending_re_review
closure_candidate_at: 2026-04-29T08:58:54Z
goal: abg-total-assurance-calculus
goal_status: active
activation_requires: T-089 completed, T-090 active/awaiting_external_agent_review, and T-086 active/awaiting_external_agent_review
proof_plan_status: accepted
change_intent: Prove that ABG total assurance projection is exhaustive, deterministic, stale-input aware, and unable to close work through worker success, passing tests, archive shape, plugin claim, or nullable closure register absence.
change_class: design_reframe
re_entry_point: proof
affected_boundary: ABG assurance projection tests, closure fold tests, stale-input invalidation tests, plugin negative tests, report/projection consumers, downstream adapter qualification scenarios
priority: high
triaged_at: 2026-04-29T07:24:15Z
created_at: 2026-04-29T07:24:15Z
updated_at: 2026-04-30T00:34:03+10:00
dependencies:
  - T-088 completed
  - T-089 completed
  - T-090 active/awaiting_external_agent_review
  - T-086 active/awaiting_external_agent_review
migration_strategy: inside_out_core_interface_migration
library_usage: consume
governing_library: build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
proof_plan:
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md
related_evidence:
  - .ai-workspace/comments/codex/20260429T172415AEST_T088_requirement_audit.md
  - .ai-workspace/comments/codex/20260429T180416AEST_T086_traversal_envelope_closure.md
  - .ai-workspace/comments/codex/20260429T180958AEST_T090_assurance_design_closure.md
  - .ai-workspace/comments/codex/20260429T182315AEST_T092_TS_assurance_projection_closure.md
  - .ai-workspace/comments/codex/20260429T184425AEST_T093_TS_assurance_gate_closure_candidate.md
  - .ai-workspace/comments/codex/20260429T185814AEST_T092_PY_assurance_projection_closure_candidate.md
  - .ai-workspace/comments/codex/20260430T005046AEST_TS_primary_release_python_paused_scope.md
governance_scope: STDO Method
intake_source: T-088 identified premature closure as the core failure class. T-089 established requirement authority, T-086 established traversal-envelope topology, and T-090 established carrier/plugin design. This ticket owns the proof matrix and proof closure.
target_truth: Proof scenarios show every ambiguity status is emitted when applicable, closure is blocked for every non-fulfilled/non-lawfully-deferred row, stale input invalidates prior closure projection, invalid event truth blocks, and old closure paths cannot bypass the assurance fold.
superseded_truth: A green traversal, worker result, test pass, archive report, plugin claim, or absent closure-register row can close work without exhaustive ambiguity projection.
non_goal:
  - Do not define the requirement law in this ticket.
  - Do not design new carriers in this ticket.
  - Do not claim Python and TypeScript tenant closure from one shared proof.
  - Do not treat paused Python evidence as an active RC gate.
  - Do not use downstream SDLC acceptance semantics as the generic ABG proof.
closure_law: Do not close until proof surfaces enumerate and verify every ambiguity status, cross-row priority, stale-input invalidation, plugin authority limits, old-path bypass prevention, and T-086 envelope compatibility. Tenant implementation tickets remain separate and tenant-local.
evaluation_criteria:
  - Proof covers `fulfilled`.
  - Proof covers `partial` and shows trace-only, planned, shallow, or unbound evidence does not close.
  - Proof covers `missing`.
  - Proof covers `stale_input` and shows stale beats fulfilled.
  - Proof covers `authority_missing`.
  - Proof covers `orphan_evidence` and shows orphan evidence never satisfies authority by default.
  - Proof covers `contradictory_authority`.
  - Proof covers `contradictory_evidence`.
  - Proof covers `deferred` and distinguishes release-lawful deferral from accidental closure.
  - Proof covers `event_ledger_invalid`.
  - Proof covers plugin negative lanes: plugin cannot emit runtime truth, hide missing authority, choose next vector, or close work.
  - Proof covers old closure path bypass prevention.
  - Proof covers deterministic replay of the assurance projection from admitted events plus current authority snapshot.
proof_surface:
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t092_total_assurance_projection_unit.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t093_assurance_gate_integration.test.mjs
  - build_tenants/abiogenesis/python/test_env/tests/test_t092_total_assurance_projection.py
  - tenant implementation tests according to accepted design
  - negative proof for superseded closure paths
  - report/projection verification
  - tenant follow-on proof remains tenant-local
non_closure_conditions:
  - proof only checks success path
  - proof collapses multiple ambiguity rows into an untyped failure bucket
  - proof does not test changed input after prior closure
  - proof leaves a nullable register, archive report, or plugin result as an independent closure authority
  - proof depends on odd_sdlc-specific requirement semantics
---

# T-091: Total Ambiguity Projection Proof

This ticket is active with an accepted proof plan.

It is not complete. Closure still requires tenant proof surfaces that satisfy
the accepted row-totality, mixed-state, stale-input, plugin-negative, old-path
bypass, report read-model, replay determinism, and T-086 envelope-compatibility
matrix.

## Accepted Proof Plan

The accepted proof plan is:

- `build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md`

That plan unblocks tenant implementation tickets without allowing them to claim
shared proof closure.

## Closure Candidate Evidence

Status remains `active`; this ticket is not closed until another agent reviews
and accepts it.

The accepted proof plan is now realized by tenant-local proof surfaces:

- TypeScript T-092 proof covers every ambiguity status, stale-input priority,
  provider authority rejection, old closure path demotion, deterministic replay,
  and report read models.
- TypeScript T-093 proof covers runner/public/archive consumption so traversal
  convergence cannot bypass non-closing assurance rows.
- Python T-092 proof remains retained reference evidence under paused tenant
  status. It is not an active TS-primary RC gate.

Verification:

- TypeScript: `npm run test:t092`, `npm run test:t093`,
  `npm run test:t072:plugins`, `npm run lint:semantic`, and
  `npm run test:semantic` passed 291 tests.
- Python reference: prior Python T-092 and T-095-PY checks remain retained
  evidence, but Python is paused by tenant registry disposition and is not an
  active release gate.

The 2026-04-30 external review red-suite blockers are resolved, but this ticket
remains active pending another-agent re-review.
