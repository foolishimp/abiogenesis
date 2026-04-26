# T-072 Realize TypeScript ABG Start-To-Iterate Engine Runner

- id: T-072
- title: Realize TypeScript ABG start-to-iterate engine runner
- type: task
- ticket_category: implementation_blocker
- status: completed
- build_tenant: typescript
- goal: restore-abg-start-to-iterate-engine-authority-before-rc
- change_intent: Implement the missing TypeScript ABG-owned iterate runner so `abg.ts.start(params)` is a safe public entry into engine-owned graph-function execution rather than a one-step public-start primitive or downstream-owned loop.
- change_class: design_reframe
- re_entry_point: typescript_m03_m04_design_surface
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: critical
- created_at: 2026-04-26
- activated_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - B-031 opened
  - B-016 reopened IoC hook standardization
  - T-044 completed M03 replay-derived iteration primitives
  - T-045 completed retry/repair carriers
  - T-046 completed replay-aware public start wiring
- blocks:
  - B-031 RC blocker closure
  - T-073 RC requalification
  - downstream SDLC.TS recursive realization proof
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/public_start.ts`, `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/result_assessment/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/event_ingress/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/gaps/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/live_status/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/asset_addressing/**`, `build_tenants/abiogenesis/typescript/code/src/cli/command.ts`, `build_tenants/abiogenesis/typescript/test_env/tests/**`, `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_*`, `build_tenants/abiogenesis/typescript/design/M04_*`, TypeScript plugin/hook inventory design asset
- intake_source: B-031 diagnosis that current TypeScript ABG has replay-derived decision/event primitives but no ABG-owned runner for repeated graph-function traversal from public start; B-016 reopen clarification that ABG must be the single framework-authoritative engine and all non-engine behavior must enter through standardized IoC plugin/provider/resolver contracts.
- target_truth: TypeScript ABG exposes one engine-owned iterate execution path that starts from admitted start params, repeatedly advances the selected graph function from replay truth, applies F_D/F_P/F_H outcomes through declared engine hooks, handles retry/continuation through ABG carriers, stops only at a lawful public outcome, and admits every non-engine implementation through a standardized plugin/provider/resolver contract with focused proof for each plugin seam.
- superseded_truth: External harnesses or downstream tenants may own the repeated traversal loop as long as they call ABG decision APIs.
- closure_law: This ticket closes only when the TypeScript package exposes and tests a first-class ABG-owned iterate runner consumed by start/public execution, the runner is compliant with B-016 IoC hook standardization, every declared plugin seam has a focused positive and negative test, and the proof fails if the loop is moved back into a test harness, CLI adapter, public-control wrapper, plugin implementation, or downstream product.
- evaluation_criteria:
  - one public package entry path exists for `start(params)` to enter the ABG-owned iterate runner
  - the iterate runner consumes replay-derived runtime events or aggregate projection on every turn
  - the runner, not a test harness, selects the next vector from replay truth
  - the runner records graph-call, frame, vector traversal, evaluation, closure, retry, continuation, and terminal events through canonical event constructors/admission
  - F_D accepted vectors can close and advance without public-start repetition
  - F_P dispatch/yield remains a lawful stop when external worker output is required
  - preserved or returned F_P result ingestion can re-enter the same engine path without a tenant-local loop
  - retry/repair and continuation re-open are driven by ABG decision carriers and replay truth
  - current TypeScript ABG plugin inventory is published before implementation closure
  - each plugin seam is classified as `Ref`, `Contract`, `Provider`, `Resolver`, `Sink`, or `Consumer`, with ABG engine-owned law named separately from plugin-owned implementation
  - plugin contracts use one standard admission/constructor/test pattern rather than ad hoc callback shapes
  - plugin design satisfies `DESIGN_MODULE_METHOD.md` before code closure, including IACS, structural carrier diagram, authority/role matrix, subordinate payload register, and module-derived unit proof
  - plugin design collapses duplicate local truth surfaces into the few real identity-bearing carriers instead of multiplying peer wrappers
  - plugin design performs a global recurrence/commonization review and consumes or creates a reusable plugin contract family where the same shape appears across seams
  - each declared plugin seam has a focused positive test proving lawful substitution and a focused negative test proving the plugin cannot own traversal, iteration, closure, or event authority outside its contract
  - no accepted proof uses `for (step < basis.graph.vectors.length)` or caller-local attempt counters as execution law
  - public start remains ignition/resume, not the implementation of iteration
- proof_surface:
  - updated M03/M04 design asset if current design wording is insufficient
  - TypeScript source for the iterate runner
  - focused unit tests over pure F_D multi-vector convergence
  - focused tests over F_P yield/result-ingest/re-entry
  - focused tests over retry/continuation path
  - TypeScript ABG plugin inventory and B-016 compliance design asset
  - TypeScript ABG plugin IACS / Irreducible Architectural Carrier Set
  - TypeScript ABG plugin structural carrier diagram using `DESIGN_MODULE_METHOD.md` stereotypes
  - TypeScript ABG plugin authority/role matrix and subordinate payload register
  - local/global optimization and collapse review for plugin seams
  - focused plugin tests for each declared runner plugin seam
  - negative test proving harness-local loop closure is not accepted as engine proof
  - negative test proving a plugin cannot append unadmitted runtime truth or select the next vector directly
  - `npm run test:t072` or equivalent focused script
  - `npm run test:t072:plugins` or equivalent focused plugin-governance script
  - `npm run test:semantic`
  - `npm run lint:semantic`
  - `git diff --check`
- non_closure_conditions:
  - implementation only renames `deriveIterationAdvanceDecision`
  - implementation only repeats `publicStart` in M04 control code
  - implementation requires downstream products to provide the loop
  - implementation accepts manual vector evaluation/closure from a test harness as engine-owned execution
  - the runner cannot prove at least a three-stage graph function reaches terminal convergence from replay truth
  - the runner cannot yield and resume around F_P work
  - any runner plugin seam is unclassified, untested, or callable as a hidden traversal controller
  - plugin implementations can emit runtime events without canonical admission
  - F_D, F_P, F_H, transport, result ingest, continuation, asset, policy, or projection behavior enters through one-off callbacks without the standard plugin contract shape
  - plugin design creates boundary inflation by adding peer carrier types where subordinate payloads or one common variant family should suffice
  - plugin design leaves duplicated route logic, callback signatures, parser re-entry, or rival local authority paths uncollapsed
  - plugin design repeats a realization pattern without an explicit commonization/library decision

## Required Shape

Minimum expected execution shape:

```text
start(params)
  -> admit request, module, graph-function target, runtime identity, policy
  -> construct ExecutionBasis
  -> iterate(ExecutionBasis, replay/runtime state, admitted plugin set)
      -> project runtime truth
      -> derive next decision
      -> open graph call/frame/vector as needed
      -> invoke or request F_D/F_P/F_H handling through declared plugin contracts
      -> admit result/evaluation truth
      -> close, yield, retry, continue, or terminate
      -> repeat until lawful public stop
  -> return PublicStartOutcome or successor public outcome projection
```

The runner may be bounded by policy. Bounded stop is lawful. Hidden external
loop ownership is not.

## Design Notes

The existing `publicStartFromRequest(...)` path is useful but insufficient. It
currently creates one public outcome per call. This ticket should decide whether
the runner lives in `M03` and is consumed by `M04`, or whether a thin `M04`
entry wrapper delegates immediately to an `M03` engine function. In either case,
the loop authority must be ABG-owned and replay-derived.

The runner should be generic. It must not hard-code `odd_sdlc`, `data_mapper`,
or enterprise-core components.

## Working Status

- 2026-04-26: Activated for TypeScript implementation.
- First work item: publish plugin design-module assets before changing runner
  code so B-016 and `DESIGN_MODULE_METHOD.md` govern the implementation.
- 2026-04-26: Completed the first TypeScript ABG start-to-iterate engine runner
  and B-016 plugin-contract slice. M03 owns replay-derived iteration; M04
  `start(...)` is an ignition/resume wrapper; `publicControlLoop(...)` is now a
  control projection over the public outcome rather than an execution loop.
- 2026-04-26: Corrected by T-074 after STDO feedback. Replayed F_P `assessed`
  truth now closes the matching vector for re-entry, and the plugin inventory
  distinguishes runner-consumed seams from classified-only hook families.

## B-016 Compliance Addendum

T-072 is also the first TypeScript closure gate for the reopened B-016 IoC hook
standardization bug. It must not treat plugin shape as a follow-up.

The plugin design is a first-class typed module boundary under
`DESIGN_MODULE_METHOD.md`. It must not close from implementation tests alone.
Before implementation closure, it must publish:

- one plugin IACS naming the prime carriers and subordinate payload families
- one module-bounded structural carrier diagram showing public/module-local
  visibility, authoritative/downstream roles, effect-edge-only payloads, and
  deferred plugin families
- one authority matrix that separates ABG engine law from plugin-owned
  implementation scope
- one subordinate payload register proving which payloads remain subordinate and
  which, if any, pass the promotion test
- one module-derived unit-test map tying every plugin test back to IACS,
  structural carrier diagram, and requirement authority
- one local/global optimization review

The TypeScript runner must publish an inventory covering at least these plugin
or provider seams:

- runtime event sink / event publication boundary
- deterministic evaluator or F_D handler
- probabilistic dispatch or F_P transport handler
- human gate or F_H admission handler
- result assessment / result-artifact ingest
- event ingress / external event admission
- continuation, retry, and repair handler
- policy provider or resolved-policy admission
- runtime identity / worker provider
- asset-addressing or operator-asset resolver
- context or external asset resolver where used by traversal
- public projection consumers such as gaps and live-status, classified as
  projections rather than engine-authoritative plugins
- GTL hook references such as `hook_ref`, classified as declaration refs rather
  than executable hidden controllers

For each seam, the ticket must state:

- engine-owned law
- plugin-owned implementation scope
- admitted input carrier
- admitted output carrier
- event authority, if any
- positive proof
- negative proof

No seam may close with "callback" as the only design explanation.

## Local And Global Collapse Rule

The plugin model must collapse.

Local collapse:

- collapse raw callback inputs into admitted local carriers before semantic use
- collapse repeated plugin result shapes into one closed outcome family where
  authority is the same
- collapse parser re-entry and local reconstruction into direct consumption of
  admitted carriers
- remove rival local authority paths for event publication, traversal selection,
  closure, retry, and continuation

Global collapse:

- compare F_D, F_P, F_H, transport, result ingest, continuation, asset, policy,
  projection, and event-ingress seams for recurring plugin shapes
- when the same contract pattern appears more than once, prefer one reusable
  plugin contract family with variants over seam-local reinvention
- if a seam does not collapse into the common family, record why it has distinct
  authority, visibility, or effect-edge law
- if the same pattern appears a third time without commonization, this ticket is
  not design-method conformant

Optimization is lawful only when it reduces duplicate truth, hidden authority,
or repeated reconstruction without changing semantic ownership.

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/start.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/control/control_loop.ts`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_PLUGIN_CONTRACT_MODEL_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

Proof:

```text
npm run test:t072
tests 14
pass 14
fail 0

npm run test:t072:plugins
tests 7
pass 7
fail 0

npm run test:semantic
tests 230
pass 230
fail 0

npm run lint:semantic
pass

git diff --check
pass
```

Closure result:

- `runEngineIterate(...)` is the single TypeScript M03 owner of repeated
  graph-function traversal for this slice.
- F_D can close a three-stage graph function to terminal convergence without a
  harness or M04 public-start loop.
- F_P and F_H stop through explicit public blocking outcomes.
- F_P assessed-result re-entry advances from replay truth without redispatching
  the already assessed edge.
- retry and continuation runtime facts remain replay-derived projection truth
  during engine iteration.
- runner-facing plugin seams collapse into one `EnginePluginContract` /
  `EnginePluginInput` / `EnginePluginOutcome` family.
- plugin outputs with event, transition, next-vector, closure, graph-call,
  frame, or vector authority fail admission.
- B-016 remains open for the broader ABG hook audit, but this TypeScript runner
  slice is B-016 compliant.
