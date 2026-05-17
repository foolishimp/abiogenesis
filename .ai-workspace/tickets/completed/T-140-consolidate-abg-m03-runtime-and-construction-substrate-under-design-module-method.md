---
id: T-140
title: Consolidate ABG M03 runtime and construction substrate under Design Module Method
type: refactor
ticket_category: abg_design_module_consolidation
status: completed
review_status: passed
priority: high
owner: codex
created_at: 2026-05-16T17:22:57+10:00
activated_at: 2026-05-16T17:22:57+10:00
updated_at: 2026-05-16T18:26:36+10:00
completed_at: 2026-05-16T18:26:36+10:00
change_class: realization_refactor
re_entry_point: implementation
goal: single-surface-functional-abg-construction-substrate
release_scope: post-3.7.1 construction substrate
build_tenant: typescript
owning_repo: abiogenesis
governance_scope: STDO Method
intake_source:
  - 2026-05-16 Codex Design Module Method self-review
  - 2026-05-16 Claude imperative-pattern review
  - T-139 construction substrate remains active and consumer-facing
dependencies:
  - .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
  - .ai-workspace/tickets/active/T-139-materialize-construction-pressure-package-for-mixed-fp-and-deterministic-follow-up.md
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md
  - .ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md
  - .ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md
  - .ai-workspace/tickets/completed/T-137-declare-generic-overlay-frame-contract-over-graph-and-observed-state.md
  - .ai-workspace/tickets/completed/T-138-classify-fd-outcomes-by-authority-placement-and-pressure-routing.md
related_tickets:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-170-implement-authority-placement-strategy-and-repair-fd-overreach.md
  - .ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md
blocks:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-170-implement-authority-placement-strategy-and-repair-fd-overreach.md
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
design_refs:
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_PRESSURE_PACKAGE_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OVERLAY_FRAME_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/shared/runtime_identity.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_consciousness.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_action_catalog.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_stages.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/observed_state.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_action_kinds.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_hook_resolution.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_intent.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_priority.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_progress.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_projection.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_runtime_events.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_validation.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_observation.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_event_causality.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_pressure_package.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/runtime_support.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/edge_assurance_contract.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugin_traversal_observer.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_modulation.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/target_carrier_contract.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/construction_runner.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/
target_truth: ABG M03 construction substrate reads as a small set of pure transforms over admitted runtime truth, with effects at explicit runner boundaries. Runtime traversal semantics have one surface shared by sync and async execution. Construction intent execution is a pure plan/materialization/delta/projection pipeline with one effect shell. Digest identity and common validation helpers are centralized. `fp_consciousness.ts` and `carriers.ts` stop acting as semantic warehouses and become composition/export surfaces over prime carrier modules.
closure_law: Close only when code, design notes, and tests prove the duplicated sync/async traversal loop is collapsed to one semantic step surface, construction runner side effects are isolated, digest identity has one implementation, construction carrier families are split according to the declared IACS, `fp_consciousness.ts` is a compatibility barrel over prime modules rather than a semantic implementation warehouse, compatibility exports are barrels over prime modules rather than duplicate implementations, existing runtime behavior is preserved by semantic tests, and no product-local or controller-local path reconstructs admitted substrate truth.
non_closure_conditions:
  - sync and async engine iteration still contain duplicated transition/reentry/assurance switch bodies
  - any M03 or GTL call site still owns local `stableJson` or SHA-256 normalization logic instead of importing the canonical identity helper
  - construction runner still mixes plan derivation, event materialization, nested graph execution, delta construction, event emission, and projection folding in one procedure
  - `fp_consciousness.ts` remains the primary home for action catalog, priority, intent admission, progress ledger, hook resolution, and construction projection
  - emitted runtime events are accumulated primarily by closure-local mutation instead of returned step outcomes and one boundary emit
  - tests prove only green behavior but not preservation of event sequence, emitted event families, pressure package identity, and sync/async parity
---

# T-140: Consolidate ABG M03 Runtime And Construction Substrate Under Design Module Method

## Entry

T-139 made the ABG construction substrate available, but the current
realization still contains avoidable method debt. The substrate passes tests,
but several modules read as procedure batches rather than the transform pipeline
required by `DESIGN_MODULE_METHOD`.

The correction is not a behavior rewrite. It is a consolidation pass:

- one runtime traversal semantic surface;
- one digest identity surface;
- one effect boundary per runner;
- smaller prime construction carrier modules;
- explicit return values over hidden mutation;
- no controller-side reconstruction of admitted runtime truth.

This ticket must land before treating the T-139 substrate as method-clean for
T-170 consumer work.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

Applicable evaluators:

- Authority Seam Closure: remove rival truth surfaces and duplicate
  reconstruction of digest, traversal, and construction event meaning.
- Essential Carrier Consolidation: split only along prime carrier boundaries;
  do not create helper wrappers that become new authority surfaces.
- Enforcement After Proof: preserve existing event and projection behavior
  first, then enforce the consolidated shape through tests and typed surfaces.
- Effect-Edge Discipline: runner effects may emit events and invoke plugins;
  semantic meaning must be returned by pure step outcomes and projections.

ODD alignment: the runtime loop is ABG substrate law over GTL graph traversal.
The refactor must not hide traversal semantics in service methods, prompt
rendering, product-local controllers, or downstream adapters.

## Findings To Correct

### H1: Duplicate Engine Iteration Loops

`engine_runner.ts` has two large loops:

- `runEngineIterate` around `code/src/abg/m03/runner/engine_runner.ts:763`;
- `runEngineIterateAsync` around `code/src/abg/m03/runner/engine_runner.ts:1274`.

Both loops carry:

- mutable `replayEvents`;
- mutable `iterationCount`;
- an `emitRunnerEvents` closure that mutates local arrays and outer
  `replayEvents`;
- reentry handling;
- assurance gate handling;
- the same transition switch.

Required correction:

- introduce one semantic iteration step surface:
  `deriveEngineIterationStep(...)` or equivalent;
- make sync and async wrappers differ only at plugin invocation;
- preserve one tail loop over `EngineIterationState`;
- return emitted events from step outcomes instead of hiding them in closure
  mutation;
- prove sync and async parity still holds.

### H2: Construction Runner Mixed Procedure

`runConstructionIntentStep` in
`code/src/abg/m03/runner/construction_runner.ts` mixes:

- selected-intent validation;
- construction event replay admission;
- before-state projection derivation;
- pressure package derivation/admission;
- event sequence arithmetic;
- materialized event construction;
- runtime graph execution;
- nested event-sink mutation;
- construction delta synthesis;
- progress/projection folding.

Required correction:

- split into pure pipeline functions:
  `deriveConstructionEffectPlan`;
  `materializeConstructionInvocationEvents`;
  `runConstructionEffectPlan`;
  `deriveConstructionDeltaFromGraphResult`;
  `composeConstructionRunnerOutcome`;
- keep `emit(...)` in one explicit effect shell;
- replace event-sink push closures with returned emitted-event carriers;
- replace manual `eventSequence + 1` / `+ 2` arithmetic with a sequence cursor.

### H3: Digest Identity Duplication

`stableJson` / SHA-256 digest logic exists in multiple modules:

- `fp_consciousness.ts`;
- `construction_pressure_package.ts`;
- `edge_assurance_contract.ts`;
- `event_factories.ts`;
- `plugin_traversal_observer.ts`;
- `traversal_modulation.ts`;
- `gtl/m01/contracts/target_carrier_contract.ts`;
- bespoke hashing in `observed_state.ts`.

Required correction:

- add one canonical identity helper module, likely
  `code/src/abg/m03/contracts/runtime_identity.ts` or shared equivalent;
- export canonical stable JSON normalization and SHA-256 digest construction;
- make field-level prefix policy explicit in that module;
- delete local digest helpers from call sites;
- add regression tests proving same logical input gets same digest across
  formerly duplicated paths.

### M1: Imperative Intent Admission Rules

`admitConstructionIntentCandidate` accumulates rejection reasons through
mutable `reasons.push(...)` control flow.

Required correction:

- express admission checks as a readonly rule registry;
- each rule returns a typed rejection ref or `null`;
- aggregate reasons with pure map/filter;
- preserve stable rejection reason ordering.

### M2: Manual Event Sequence Arithmetic

`construction_runner.ts` manually assigns event sequence values with `+ 1` and
`+ 2`.

Required correction:

- introduce a sequence cursor;
- each materialization step returns `[event, nextCursor]` or an equivalent
  readonly cursor outcome;
- tests must fail if inserting a new event silently duplicates or skips
  sequence order.

### M3: Closure-Driven Emitted Event Mutation

`engine_runner.ts` and `construction_runner.ts` use mutable `emittedEvents`
arrays and event-sink closures that mutate outer scope.

Required correction:

- semantic steps return emitted events explicitly;
- one boundary function performs `emit(...)`;
- nested runner emission must be reflected as an explicit returned event family,
  not an incidental side effect of a captured array.

## Implementation Order

Land as small slices and keep the full semantic suite green after each slice.

1. Identity consolidation first. Add the canonical digest helper and remove
   duplicate local digest implementations.
2. Engine iteration kernel second. Collapse duplicated sync/async traversal
   bodies into one semantic step surface.
3. Construction runner pipeline third. Split plan, materialization, effect,
   delta, and outcome composition.
4. Construction carrier module split fourth. Move action catalog, priority,
   intent admission, progress ledger, projection, and hook resolution out of
   `fp_consciousness.ts` into prime modules.
5. Opportunistic cleanups. Convert intent admission rules, sequence cursor, and
   emitted-events return carriers while touching the owning boundary.

## Irreducible Architectural Carrier Set

This ticket does not add product semantics. It consolidates the realization
around the existing substrate carriers.

Prime carrier families already in scope:

- `RuntimeEvent`;
- `RuntimeAggregateProjection`;
- `EngineIterationState`;
- `EngineStepOutcome`;
- `ConstructionRuntimeEffectPlan`;
- `ConstructionPressurePackage`;
- `ConstructionGraphActionInvokedEvent`;
- `ConstructionDeltaObservedEvent`;
- `ConstructionRunnerStepOutcome`;
- `ConstructionProjection`.

Prime helper surface introduced by this ticket:

- `RuntimeIdentityDigest` or equivalent canonical digest helper contract.

Subordinate payloads:

- display strings;
- per-branch result fragments;
- test fixture refs;
- prompt-rendering fragments;
- local cursor internals;
- rule-registry function rows that do not cross the module boundary.

## Acceptance

- [x] Add a canonical runtime identity helper and remove local `stableJson` /
  SHA-256 implementations from the affected M03/GTL call sites.
- [x] Normalize digest prefix policy through the canonical helper and update
  tests for every carrier whose digest string changes.
- [x] Collapse sync and async engine iteration into one semantic traversal step
  surface with thin sync/async plugin invocation wrappers.
- [x] Preserve engine runner behavior for F_D advance, F_P dispatch, F_H
  escalation, graph reentry, assurance-blocked terminal, bounded retry, and
  terminal convergence.
- [x] Split `runConstructionIntentStep` into pure derivation/materialization/
  delta/projection functions plus one explicit effect shell.
- [x] Replace construction event sequence arithmetic with a sequence cursor.
- [x] Replace closure-driven emitted-event accumulation with explicit returned
  emitted-event carriers and one boundary emit.
- [x] Convert construction intent admission rejection checks into a rule
  registry with stable rejection ordering.
- [x] Split action-kind carrier authority into
  `code/src/abg/m03/contracts/construction_action_kinds.ts`.
- [x] Split shared construction validation helpers into
  `code/src/abg/m03/contracts/construction_validation.ts`.
- [x] Split action catalog into a prime module boundary.
- [x] Split priority policy and priority projection into a prime module
  boundary.
- [x] Split intent admission into a prime module boundary.
- [x] Split progress ledger into a prime module boundary.
- [x] Split construction projection into a prime module boundary.
- [x] Split hook resolution into a prime module boundary.
- [x] Split construction runtime event constructors into a prime module
  boundary.
- [x] Preserve compatibility exports only where they are barrels over the new
  modules; do not keep duplicate implementation surfaces.
- [x] Add or update tests proving digest parity, sync/async runner parity,
  event sequence preservation, construction pressure package identity, emitted
  event family preservation, and construction runner outcome equivalence.
- [x] Add a close-time audit note that maps each parity proof to concrete test
  files instead of relying on suite-green implication alone.
- [x] Run `npm run lint:semantic`.
- [x] Run `npm run test:t099`.
- [x] Run `npm run test:t127`.
- [x] Run `npm run test:t128`.
- [x] Run `npm run test:t136`.
- [x] Run `npm run test:t137`.
- [x] Run `npm run test:t139`.
- [x] Run `npm run test:t140`.
- [x] Run `npm run test:semantic`.
- [x] Run `git diff --check`.

## Parity Proof Map

- Digest parity and prefix policy:
  `test_env/tests/test_t140_runtime_identity_consolidation.test.mjs`,
  `test_env/tests/test_t099_fp_stage_carriers.test.mjs`, and
  `test_env/tests/test_t136_observed_state_admission.test.mjs`.
- Sync/async runner parity:
  `test_env/tests/test_t107_traversal_modulation_unit.test.mjs`,
  `test_env/tests/test_m03_engine_owned_iterate_runner_unit.test.mjs`, and
  `test_env/tests/test_m04_engine_start_integration.test.mjs`.
- Event sequence preservation and emitted event family preservation:
  `test_env/tests/test_t128_construction_runner.test.mjs`.
- Construction pressure package identity:
  `test_env/tests/test_t139_construction_pressure_package.test.mjs`.
- Construction runner outcome equivalence:
  `test_env/tests/test_t128_construction_runner.test.mjs` plus the full
  semantic suite.

## Implementation Note 2026-05-16

Completed slices:

- canonicalized runtime identity helpers in `code/src/shared/runtime_identity.ts`
  and removed local digest implementations from the affected M03/GTL call
  sites, including `code/src/abg/m03/contracts/observed_state.ts` and
  `code/src/abg/m03/contracts/fp_stages.ts`;
- collapsed sync/async `engine_runner.ts` execution through one generator-backed
  traversal machine and explicit event emission state;
- split `construction_runner.ts` into plan derivation, sequenced invocation
  materialization, one runtime effect shell, delta derivation, and outcome
  composition;
- replaced construction sequence `+ 1` / `+ 2` arithmetic with a sequence
  cursor;
- converted construction intent admission reasons to a stable rule registry;
- split action-kind authority into
  `code/src/abg/m03/contracts/construction_action_kinds.ts`;
- split shared construction validation helpers into
  `code/src/abg/m03/contracts/construction_validation.ts`.
- split action catalog and observation-to-action binding into
  `code/src/abg/m03/contracts/construction_action_catalog.ts`;
- split priority policy, affect routing, ranking, and priority projection into
  `code/src/abg/m03/contracts/construction_priority.ts`;
- split construction intent candidates, admission rules, and selected-intent
  priority selection into `code/src/abg/m03/contracts/construction_intent.ts`;
- split progress ledger derivation and construction Event Calculus projection
  into `code/src/abg/m03/contracts/construction_progress.ts`;
- split construction public projection and summary agreement into
  `code/src/abg/m03/contracts/construction_projection.ts`;
- split runtime construction event constructors into
  `code/src/abg/m03/contracts/construction_runtime_events.ts`;
- split GTL hook resolution into
  `code/src/abg/m03/contracts/construction_hook_resolution.ts`;
- reduced `code/src/abg/m03/contracts/fp_consciousness.ts` to a 21-line
  compatibility barrel over the prime modules.

Prior review disposition:

- Addresses prior review H1/H2 by completing the remaining digest
  consolidation sites, adding the missing affected-boundary files, and making
  the `fp_consciousness.ts` barrel constraint closure-gating.
- Addresses prior review H3 by replacing the overbroad parity-test checkbox
  with an explicit proof map.
- Completes the full `fp_consciousness.ts` prime-module split; remaining
  verification is lint and semantic-suite proof over the new module graph.

Remaining closure blocker:

- None after verification. `fp_consciousness.ts` is now a compatibility barrel;
  it must not regain implementation logic.

Verification:

- `npm run lint:semantic`
- `npm run test:t099`
- `npm run test:t127`
- `npm run test:t128`
- `npm run test:t136`
- `npm run test:t137`
- `npm run test:t139`
- `npm run test:t140`
- `npm run test:semantic` (561 tests, 0 failures)
- `git diff --check`

## Non-Goals

- Do not change GTL graph semantics.
- Do not add product-specific SDLC logic.
- Do not introduce prompt-rendering contracts.
- Do not create a second runtime controller.
- Do not preserve duplicate digest surfaces for backwards compatibility.
- Do not close T-139 by this refactor alone; T-139 still needs downstream
  deletion proof.
