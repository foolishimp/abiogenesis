# B-031 Reopen TypeScript ABG RC Over Missing Engine-Owned Iterate Runner

- id: B-031
- title: Reopen TypeScript ABG RC over missing engine-owned iterate runner
- type: bug
- ticket_category: rc_blocker
- status: completed
- build_tenant: typescript
- goal: restore-abg-start-to-iterate-engine-authority-before-rc
- change_intent: The TypeScript ABG line claims internal graph-function iteration, but current proof shows only decision/event primitives exercised by harness or downstream loops. Reopen the RC claim until ABG owns `start -> iterate` execution.
- change_class: product_reprice
- re_entry_point: product_definition
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: critical
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-046 completed with only replay-aware public start wiring
  - T-066 completed with a false-positive harness-loop proof
  - T-071 readiness decision depended on T-066
  - odd_sdlc B-068 exposed the missing substrate-owned recursive realization loop
- blocks:
  - TypeScript ABG RC readiness claim
  - SDLC.TS claim that recursive realization is ABG-native
  - any downstream proof that cites T-066 as engine-owned iterate evidence
- affected_boundary: `specification/INTENT.md`, `specification/PRODUCT.md`, `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`, TypeScript RC reports and readiness comments
- intake_source: Operator correction that ABG public entry is `abg.ts.start(params)`, but traversal control after start must be ABG-owned `iterate`, not a downstream or harness-owned loop.
- target_truth: TypeScript ABG RC is reopened until `abg.ts.start(params)` admits or resumes a published graph-function boundary and delegates repeated traversal, evaluation, retry, continuation, and lawful stop handling to an ABG-owned iterate engine.
- superseded_truth: Green tests for replay-derived decision primitives, public-start replay input, or harness-authored loops are sufficient to claim internal iterate engine readiness.
- closure_law: This blocker closes only after T-072 lands an engine-owned TypeScript iterate runner, T-073 requalifies the RC claim, T-066/T-071 evidence is repriced or superseded, and no RC/readiness surface claims graph-function execution parity from harness-local loop counters or public-start repetition.
- evaluation_criteria:
  - RC/readiness surfaces identify this as an open blocker until repaired
  - T-066 is explicitly classified as primitive/harness proof, not engine-owned iterate proof
  - `REQ-R-ABG3-INTERPRET-010` is the governing requirement for the repair
  - downstream `odd_sdlc` B-068 is treated as evidence of the substrate gap, not as an ABG closure proof
  - implementation and requalification work are split into concrete tickets
- proof_surface:
  - T-072 implementation ticket
  - T-073 requalification ticket
  - updated RC/readiness report or replacement comment
  - test evidence showing `start -> iterate` owns the loop inside ABG
- non_closure_conditions:
  - `publicStart` remains only a one-step transition while RC claims internal iteration
  - tests advance by `for (step < basis.graph.vectors.length)` outside ABG
  - tests manually append accepted `vector_evaluated` and `vector_closed` events as proof of engine ownership
  - downstream products carry recursive realization loops locally
  - T-066 remains cited as sufficient RC evidence without repricing

## Defect

The TypeScript line has the pieces of iteration:

- replay-derived aggregate projection
- `IterationAdvanceDecision`
- runtime event factories
- retry/repair decision carriers
- public start as a safe ignition boundary

It does not yet expose a first-class ABG-owned iterate runner.

The completed T-066 proof is therefore overclaimed. Its proof test drives
iteration from the test harness by looping over vector count and manually
emitting accepted evaluation and closure events. That proves the decision
algebra can be used, but it does not prove ABG owns graph-function execution.

## Required Reprice

The lawful boundary is:

```text
User
-> agent CLI or assistant adapter
-> constructs start params
-> abg.ts.start(params)
-> ABG admits or resumes graph-function execution
-> ABG internal iterate engine runs
-> ABG returns yielded/converged/stopped/gap/human-gate truth
```

The adapter may construct params. The adapter must not own traversal control.
Downstream products may provide graph functions, domain plugins, F_D/F_P/F_H
evaluators, and proof interpretation. They must not replace ABG's iterate
engine with a tenant-local loop.

## Ticket Split

- T-072 implements the missing TypeScript ABG `start -> iterate` engine runner.
- T-073 requalifies the TypeScript RC and reprices false-positive readiness
  evidence after the repair.

## Closure Evidence

Completed on 2026-04-26.

Repair:

- `T-072` completed the TypeScript M03 engine-owned iterate runner.
- `T-072` added runner-facing plugin-contract admission and authority-negative
  proof.
- `M04 start(...)` delegates to the M03 runner.
- `publicControlLoop(...)` projects over public outcome truth instead of owning
  graph-function execution.

Requalification:

- `T-073` completed RC requalification.
- T-066 is repriced as historical primitive/harness proof.
- T-071 remains green only under the repaired T-072/T-073 evidence chain.
- RC notes and product definition now state the engine-owned start-to-iterate
  requirement.

Observed RC gates:

```text
npm run test:t072
tests 11
pass 11
fail 0

npm run test:semantic
tests 230
pass 230
fail 0

npm run test:t064
tests 3
pass 3
fail 0

CODEX_LIVE_FP=1 npm run test:live:uat
tests 1
pass 1
fail 0

CODEX_LIVE_FP=1 npm run test:live
tests 1
pass 1
fail 0

npm run lint:semantic
pass

git diff --check
pass
```

Result:

This RC blocker is closed. The TypeScript ABG RC no longer depends on
public-start repetition, harness-local vector loops, or downstream product
loops to claim graph-function execution.
