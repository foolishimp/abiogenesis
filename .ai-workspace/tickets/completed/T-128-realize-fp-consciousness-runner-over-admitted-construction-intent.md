---
id: T-128
title: Realize installed construction runner over admitted construction intent
type: feature
ticket_category: implementation_followup
status: completed
review_status: passed
goal: generic-homeostatic-fp-construction-evaluator
change_intent: Add the installed ABG runner path that consumes admitted construction intent, invokes graph work, records construction runtime deltas, and recurs through the existing T-127 substrate without CLI, harness, downstream product, or projection-only drain authority owning the loop.
change_class: realization_refactor
re_entry_point: implementation
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/
  - build_tenants/abiogenesis/typescript/test_env/
priority: high
build_tenant: typescript
release_scope: post-3.7.0-rc.1 runtime execution slice
triaged_at: 2026-05-08T02:00:57+10:00
created_at: 2026-05-08T02:00:57+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-16T16:08:00+10:00
completed_at: 2026-05-16T16:08:00+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
builds_on:
  - .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
dependencies:
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
  - .ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md
  - .ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md
  - .ai-workspace/tickets/completed/T-138-classify-fd-outcomes-by-authority-placement-and-pressure-routing.md
reference_documents:
  - .ai-workspace/comments/codex/20260516T141749Z_abg_construction_substrate_test35_reference.md
requirement_refs:
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_STRUCTURAL_CARRIER_DIAGRAM.md
current_evidence:
  - T-127 provides admitted construction intent, construction graph-action invocation event construction, construction delta/progress ledger truth, terminal projection, and read-only public gaps evaluator projection.
  - T-127 intentionally does not claim an installed ABG runner loop that consumes AdmittedConstructionIntent and performs recursive graph work.
  - Downstream odd_sdlc test35 behavior shows the missing substrate is not deterministic projection drain alone; the load-bearing loop is current observed state plus pressure, F_P construction, admitted evidence, deterministic follow-up, pressure reprojection, and lawful yield/retry/re-enter/close.
target_truth: Installed ABG runtime can consume an AdmittedConstructionIntent, invoke the selected graph function/vector through ABG runner mechanics, append admitted construction_graph_action_invoked and construction_delta_observed events, rederive ConstructionProjection, and tail-recur until progress, closure, block, F_H input, or escalation. The first meaningful proof includes at least one F_P graph action followed by deterministic follow-up/evidence admission so the runner proves mixed construction behavior, not only F_D projection drain. CLI, public gaps, test harnesses, and downstream products remain adapters/read models/consumers and do not own retry, re-observation, selection, or loop authority.
closure_law: Close only when deterministic and installed/live tests prove that a selected admitted construction intent is consumed by an ABG runner path, not by CLI/harness glue or downstream product controller code, that replay events alone reproduce the next ConstructionProjection, and that a mixed F_P plus deterministic follow-up slice can progress, reproject pressure, and yield or close from admitted evidence.
non_closure_conditions:
  - CLI decides the next construction action or loops over gaps output
  - public gaps appends events or dispatches graph work
  - downstream product code owns the runner loop or refresh-then-poll control flow
  - proof covers only F_D or projection-only auto-advance without a bounded F_P construction action
  - runner invokes graph work from prompt prose or candidate output that was not admitted
  - construction deltas are accepted without causation to an admitted intent and graph-action invocation
  - tests prove only carrier construction but not installed runner consumption
related_tickets:
  - .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
  - .ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md
  - .ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md
  - .ai-workspace/tickets/completed/T-138-classify-fd-outcomes-by-authority-placement-and-pressure-routing.md
  - .ai-workspace/tickets/active/T-139-materialize-construction-pressure-package-for-mixed-fp-and-deterministic-follow-up.md
---

# T-128: Realize Installed Construction Runner Over Admitted Construction Intent

## Entry

T-127 closed the first-slice substrate. It did not close installed runner-level
recursion. This ticket owns the execution slice.

The proof target is not an F_D-only projection drain. The Python SDLC reference
line filled a substrate gap by repeatedly observing workspace/register state,
projecting pressure, dispatching constructive work, admitting evidence, and
reprojecting pressure. ABG must own that loop generically. Downstream domains
must supply graphs, pressure projectors, overlays, and evaluators, not controller
loops. The canonical historical behavior being translated is recorded in
`.ai-workspace/comments/codex/20260516T141749Z_abg_construction_substrate_test35_reference.md`.

## Load-Bearing Mixed Slice

The first closing proof must include:

1. an admitted construction observation and action catalog;
2. an admitted construction intent selecting a constructive graph action;
3. one F_P graph action invocation through the ABG runner;
4. admitted construction delta and evidence;
5. deterministic follow-up or projection over the admitted result;
6. replay-derived `ConstructionProjection`;
7. lawful yield, retry, re-entry, block, F_H route, or close from replay truth.

Projection-only auto-advance may be a supporting test. It is not sufficient
closure for this ticket.

The initial proof scenario is a synthetic mixed-regime graph under
`build_tenants/abiogenesis/typescript/test_env/tests/`. Real `odd_sdlc`
consumer proof is deferred to the consumer-side migration ticket; this ticket
must not become an implementation of that downstream product as a side effect.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: the runner is not the graph program and must not decide product
meaning, target movement, or closure by controller logic. It realizes declared
GTL/ABG traversal over admitted construction intent.

Module roles:

- carrier module for admitted runner input/output carriers;
- semantic kernel for pure next-runner-step derivation from admitted truth;
- effect shell only for event append, worker invocation, and public projection
  publication;
- projection module for replay-derived `ConstructionProjection`.

Irreducible Architectural Carrier Set for this ticket:

- `AdmittedConstructionIntent`;
- `ConstructionGraphActionInvokedEvent`;
- `ConstructionRunnerStepOutcome`;
- `ConstructionProjection`;
- `ConstructionRuntimeEffectPlan`.

Subordinate payloads: worker dispatch metadata, test fixture rows, event append
request detail, and projection row details remain nested/private unless a later
design proves independent authority. Do not create peer carrier families only to
make typing easier.

Design assets required before design-method closure:

- structural carrier diagram for the runner boundary, including effect-edge
  payloads and downstream projections;
- module-derived unit tests for runner ownership, not helper layout;
- negative proof that CLI, public gaps, or downstream product code cannot
  bypass the admitted runner path and silently reconstruct next-work truth;
- post-ticket design review recording boundary-local cleanup and recurrence
  extraction decisions before closure.

## Implementation Closure

Implemented surfaces:

- `code/src/abg/m03/runner/construction_runner.ts`
- `code/src/abg/m03/runner/index.ts`
- `code/src/abg/m03/contracts/fp_consciousness.ts`
- `code/src/abg/m03/contracts/index.ts`
- `test_env/tests/test_t128_construction_runner.test.mjs`
- `package.json`
- `build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_STRUCTURAL_CARRIER_DIAGRAM.md`

Closure result:

- `runConstructionIntentStep` consumes a selected `AdmittedConstructionIntent`,
  emits `construction_graph_action_invoked`, invokes the selected graph through
  the existing ABG iterate runner, emits `construction_delta_observed`, and
  rederives progress ledger plus `ConstructionProjection` from replay.
- The closing synthetic proof runs a mixed graph with F_P first and F_D
  follow-up vectors. The F_P result is attached/admitted through the existing
  runner path; F_D authority events remain replay-visible.
- Public gaps observes the runner-produced converged runtime events as read-only
  projection truth and does not dispatch graph work.
- Negative proof rejects an admitted intent that is not the selected priority
  intent.

Closure evidence:

- `npm run test:t128` passed: 2 tests, 0 failures.
- `npm run test:t127:unit` passed: 27 tests, 0 failures.
- `npm run test:t135` passed: 6 tests, 0 failures.
- `npm run test:t136` passed: 8 tests, 0 failures.
- `npm run test:t138` passed: 5 tests, 0 failures.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `git diff --check` passed.
- `npm run test:semantic` passed: 552 tests, 0 failures.

## Acceptance

- [x] Define the runner boundary that consumes `AdmittedConstructionIntent`.
- [x] Attach or update the structural carrier diagram for the runner boundary.
- [x] Declare the final IACS and subordinate payload split before code closure.
- [x] Use a synthetic mixed-regime proof graph under
  `build_tenants/abiogenesis/typescript/test_env/tests/` for the first closing
  proof.
- [x] Reuse `constructConstructionGraphActionInvokedEvent`; do not duplicate
  graph-action invocation identity in M04 or CLI.
- [x] Append construction runtime events only through admitted runtime/event
  boundaries.
- [x] Reproject `ConstructionProjection` from replay after each runner step.
- [x] Prove the loop is tail-recursive over replay state, not JS call-stack or
  CLI iteration authority.
- [x] Prove a mixed F_P plus deterministic follow-up slice; F_D-only projection
  drain is non-closing.
- [x] Add deterministic tests for admitted-intent runner consumption.
- [x] Add installed/live proof that public gaps observes runner-produced
  construction progress without dispatching work itself.
