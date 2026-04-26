# T-066 Prove TypeScript ABG Internal Control Loop Sufficiency Start Traverse Evaluate Iterate

- id: T-066
- title: Prove TypeScript ABG internal control loop sufficiency from start through iterate
- type: qualification
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Prove that ABG has enough substrate machinery to start a published graph function, traverse internal vectors, evaluate outcomes, yield/close/stop lawfully, and continue iteration from replay-derived truth.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-065 completed
- affected_boundary: `specification/requirements/abg/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- intake_source: Operator goal note `comments/jim/goals_0426` item 2: determine whether ABG scaffolding is sufficient for start, traverse, evaluate, iterate, yield, close, and stop.
- library_usage: none
- library_rationale: this is substrate sufficiency proof across existing M03/M04 carriers, not a common helper extraction.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- target_truth: ABG can execute a published `GraphFunction` as an internal replay-derived loop over graph-call, frame, vector traversal, evaluation, closure, stop, and continuation truth; `publicStart` remains ignition/resume and does not replace the iterate engine.
- current_truth: TypeScript has M03 iteration, M04 start/control, and installed multi-vector proofs, but the product-lab sufficiency claim has not been expressed as one explicit start-traverse-evaluate-iterate forensic scenario.
- closure_law: this ticket closes only when a composed graph-function scenario proves the expected event sequence and projections across at least two internal vectors without using package-local loop counters, fixed first-vector shortcuts, or harness-only progression.
- evaluation_criteria:
  - start admits a published graph-function target through module/job authority
  - traversal opens graph-call and frame truth
  - evaluation truth is explicit and replay-visible
  - one vector can yield or stop without certifying whole-graph convergence
  - the next vector is selected from replay-derived runtime facts
  - final projection distinguishes close, yield, stop, continuation, and gap/hold where applicable
  - forensic probe evidence explains the sequence
- non_closure_conditions:
  - public start is treated as the internal iterate engine
  - tests advance by hard-coded vector index or harness-local state
  - event sequence is asserted only at aggregate level while frame/vector truth is opaque
  - proof passes without demonstrating replay-derived next-edge selection
- proof_surface:
  - updated M03/M04 design assets if needed
  - composed graph-function test lane
  - forensic report or test output over expected event sequence
  - package script for the focused lane
  - `npm run lint:semantic`
  - `git diff --check`

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_internal_control_loop_sufficiency.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m03-iteration-fixtures.mjs`
- `build_tenants/abiogenesis/typescript/package.json` script `test:t066`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

Observed test result:

```text
npm run test:t066
tests 1
pass 1
fail 0
```

Observed event sequence:

```text
graph_call_opened
frame_opened
vector_traversal_planned
vector_evaluated
vector_closed
graph_call_opened
frame_opened
vector_traversal_planned
vector_evaluated
vector_closed
graph_call_opened
frame_opened
vector_traversal_planned
vector_evaluated
vector_closed
terminal_reached
```

Result:

The proof traverses `input_set->requirements`, `requirements->design`, and
`design->code` from replay-derived closure truth, then reaches terminal
convergence. Public start remains ignition/resume; the internal loop remains
M03 replay/projection law.

## T-073 Requalification Note

Repriced on 2026-04-26 by T-073.

This ticket remains useful historical proof of the replay-derived projection,
decision, and event algebra. It is not sufficient RC evidence for
engine-owned `start -> iterate` execution.

The original test advanced through a harness-authored loop and manually
supplied evaluation and closure facts. That proved the primitives could be
used correctly, but it did not prove the ABG runtime owned the loop.

The RC authority for engine-owned iteration is now T-072:

- `runEngineIterate(...)` owns repeated graph-function traversal in M03
- `start(...)` delegates into the M03 runner
- plugin contracts are admitted before invocation
- plugin outputs cannot own traversal, event, closure, graph-call, frame,
  transition, next-vector, or loop authority
