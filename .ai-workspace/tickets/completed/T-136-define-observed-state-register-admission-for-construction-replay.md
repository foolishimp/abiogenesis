---
id: T-136
title: Define observed state and register admission for construction replay
type: feature
ticket_category: abg_observed_state_admission
status: completed
review_status: passed
priority: critical
owner: codex
created_at: 2026-05-16T13:58:40+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-16T15:40:00+10:00
completed_at: 2026-05-16T15:40:00+10:00
change_class: design_reframe
re_entry_point: design
goal: replay-safe-observed-state-substrate
release_scope: post-3.7.1 construction substrate
build_tenant: typescript
owning_repo: abiogenesis
governance_scope: STDO Method
intake_source:
  - 2026-05-16 review of Python SDLC outer-loop behavior
  - Python reference repeatedly read workspace/register state and called refresh_analysis before choosing re-entry
  - TypeScript substrate needs replay-safe observed-state admission instead of controller refresh-then-poll loops
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_STRUCTURAL_CARRIER_DIAGRAM.md
dependencies:
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
reference_documents:
  - .ai-workspace/comments/codex/20260516T141749Z_abg_construction_substrate_test35_reference.md
related_tickets:
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
  - .ai-workspace/tickets/completed/T-137-declare-generic-overlay-frame-contract-over-graph-and-observed-state.md
  - .ai-workspace/tickets/active/T-139-materialize-construction-pressure-package-for-mixed-fp-and-deterministic-follow-up.md
affected_boundary:
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/test_env/tests/
  - build_tenants/abiogenesis/typescript/package.json
target_truth: ABG can admit observed workspace and register state as replay-visible construction inputs. Every observation that can influence construction selection, overlay firing, re-entry, pressure projection, or closure carries a stable observed-state ref, source kind, scope, digest or version, event watermark, freshness policy, and derivation basis. The qualification rule is explicit: anything a fire_when predicate, terminate_when predicate, selection decision, pressure projector, or closure predicate reads must be admitted observed state. Controllers do not privately refresh and poll state to decide the next action.
closure_law: Close only when deterministic tests prove that construction selection and overlay/re-entry decisions can be replayed from admitted observed-state records, stale or mismatched observed-state digests fail closed, and no runner/controller path requires a side-effecting refresh call to learn whether the next action should fire.
non_closure_conditions:
  - observed state remains a private object read by runner or app code
  - decisions depend on current filesystem or process cwd without an admitted observation record
  - observation identity lacks event watermark, digest/version, or derivation basis
  - tests assert carrier construction without replaying the same decision from observed-state truth
---

# T-136: Define Observed State And Register Admission For Construction Replay

## Entry

The Python reference behaved correctly because registers and workspace artifacts
were the mutable reality read between attempts. In ABG, those reads must become
admitted observed-state truth so replay can reproduce the same construction and
re-entry decisions.

Qualifying observed-state kinds are workspace files, register JSON, derived
projections, event-spine watermarks, and ambient policy/config values that affect
selection, overlay firing, pressure projection, routing, or closure. Transient
executor process state is not observed state unless a declared predicate reads
it to make one of those decisions.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: observed state is admitted context for graph traversal. It must
not become a private controller refresh loop, a mutable workspace object at the
semantic center, or a side-door authority for next-work selection.

Module roles:

- carrier module for observed-state records and derivation basis;
- admission boundary for workspace/register/projection/policy observations;
- projection module for replay-visible observation state;
- effect shell only for reading external state before admission.

Irreducible Architectural Carrier Set for this ticket:

- `ObservedStateRecord`;
- `ObservedStateSourceRef`;
- `ObservedStateDerivationBasis`;
- `ObservedStateAdmissionOutcome`;
- `ObservedStateStalenessDiagnostic`.

Subordinate payloads: raw filesystem stats, register-field fragments,
projection row fragments, and freshness-calculation details remain subordinate
and must not be consumed by semantic kernels after admission.

Design assets required before design-method closure:

- structural carrier diagram showing source refs, derivation basis, admission
  outcome, diagnostics, and downstream projection;
- explicit ingress collapse rule for raw workspace/register reads;
- negative proof that current filesystem/cwd/process state cannot bypass an
  admitted observation record;
- module-derived unit tests for stale digest, mismatched watermark, and
  missing derivation basis.

## Implementation Closure

Implemented surfaces:

- `code/src/abg/m03/contracts/observed_state.ts`
- `code/src/abg/m03/contracts/carriers.ts`
- `code/src/abg/m03/contracts/event_factories.ts`
- `code/src/abg/m03/contracts/event_admission.ts`
- `code/src/abg/m03/contracts/event_calculus.ts`
- `code/src/abg/m03/contracts/projection.ts`
- `code/src/abg/m03/contracts/retry_frontier.ts`
- `code/src/abg/m03/contracts/plugins.ts`
- `code/src/abg/m03/contracts/fp_consciousness.ts`
- `test_env/tests/test_t136_observed_state_admission.test.mjs`
- `test_env/tests/test_t127_fp_consciousness_loop_unit.test.mjs`
- `build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_STRUCTURAL_CARRIER_DIAGRAM.md`

Post-review hardening:

- Runtime aggregate projection now composes `ObservedStateProjection`, so
  runner and overlay consumers do not need a separate refresh/re-fold path to
  see admitted observed state.
- `EnginePluginInput` now exposes the observed-state projection ref and admitted
  observed-state refs from the aggregate projection.
- Construction snapshot coverage now returns typed
  `observed_state_snapshot_unadmitted_ref` diagnostics and throws a
  domain-specific rejected-coverage error only at the assertion boundary.
- Source-kind coverage now exercises `workspace_file`, `register_json`,
  `derived_projection`, `event_spine_watermark`, and `policy_config`.

Closure evidence:

- `npm run test:t136` passed: 8 tests, 0 failures.
- `npm run test:t127` passed: 33 tests, 0 failures.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `git diff --check` passed.
- `npm run test:semantic` passed: 550 tests, 0 failures.

## Acceptance

- [x] Define generic observed-state/register carriers and admission rules.
- [x] Attach or update the structural carrier diagram for observed-state
  admission.
- [x] Declare the final IACS and subordinate payload split before code closure.
- [x] Enumerate the qualifying observed-state kinds and enforce the rule that
  any field read by fire_when, terminate_when, selection, pressure projection,
  routing, or closure must be admitted observed state.
- [x] Record source kind, scope, digest or version, event watermark, freshness
  policy, and derivation basis.
- [x] Integrate observed-state refs into construction observation snapshots.
- [x] Prove runner decisions replay from admitted observed-state records.
- [x] Prove stale/mismatched observation records fail closed.
- [x] Remove any need for orchestration-time refresh calls in the tested slice.
