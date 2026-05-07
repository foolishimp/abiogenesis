---
id: T-128
title: Realize F_P consciousness runner over admitted construction intent
type: feature
ticket_category: implementation_followup
status: backlog
review_status: not_started
goal: generic-homeostatic-fp-construction-evaluator
change_intent: Add the installed ABG runner path that consumes admitted construction intent, invokes graph work, records construction runtime deltas, and recurs through the existing T-127 substrate without CLI or harness-owned loop authority.
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
owning_repo: abiogenesis
governance_scope: STDO Method
parent_ticket: .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
requirement_refs:
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md
current_evidence:
  - T-127 provides admitted construction intent, construction graph-action invocation event construction, construction delta/progress ledger truth, terminal projection, and read-only public gaps evaluator projection.
  - T-127 intentionally does not claim an installed ABG runner loop that consumes AdmittedConstructionIntent and performs recursive graph work.
target_truth: Installed ABG runtime can consume an AdmittedConstructionIntent, invoke the selected graph function/vector through ABG runner mechanics, append admitted construction_graph_action_invoked and construction_delta_observed events, rederive ConstructionProjection, and tail-recur until progress, closure, block, F_H input, or escalation. CLI and public gaps remain adapters/read models and do not own retry or selection authority.
closure_law: Close only when deterministic and installed/live tests prove that a selected admitted construction intent is consumed by an ABG runner path, not by CLI/harness glue, and that replay events alone reproduce the next ConstructionProjection.
non_closure_conditions:
  - CLI decides the next construction action or loops over gaps output
  - public gaps appends events or dispatches graph work
  - runner invokes graph work from prompt prose or candidate output that was not admitted
  - construction deltas are accepted without causation to an admitted intent and graph-action invocation
  - tests prove only carrier construction but not installed runner consumption
---

# T-128: Realize F_P Consciousness Runner Over Admitted Construction Intent

## Entry

T-127 closed the first-slice substrate. It did not close installed runner-level
recursion. This ticket owns the execution slice.

## Acceptance

- [ ] Define the runner boundary that consumes `AdmittedConstructionIntent`.
- [ ] Reuse `constructConstructionGraphActionInvokedEvent`; do not duplicate
  graph-action invocation identity in M04 or CLI.
- [ ] Append construction runtime events only through admitted runtime/event
  boundaries.
- [ ] Reproject `ConstructionProjection` from replay after each runner step.
- [ ] Prove the loop is tail-recursive over replay state, not JS call-stack or
  CLI iteration authority.
- [ ] Add deterministic tests for admitted-intent runner consumption.
- [ ] Add installed/live proof that public gaps observes runner-produced
  construction progress without dispatching work itself.
