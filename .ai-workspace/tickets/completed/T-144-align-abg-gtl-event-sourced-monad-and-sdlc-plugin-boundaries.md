# T-144 Align ABG/GTL Event-Sourced Monad And SDLC Plugin Boundaries

- id: T-144
- title: Align ABG/GTL event-sourced monad and SDLC plugin boundaries
- type: requirement_alignment
- ticket_category: specification_compliance
- status: completed
- proof_status: passed
- build_tenant: typescript
- goal: ratify and realize the ABG event-sourced monad framing over selected GTL composition so downstream SDLC coding boundaries are explicit and enforceable
- change_intent: Align GTL compute notation, ABG plugin/runtime law, and downstream product guidance around the staged model `ABG.start(fn<A, B>.C).bind(system...).bind(plugin.transform.C).bind(system...).bind(plugin.evaluate.C)...`, without introducing a new GTL carrier or letting products own ABG side effects.
- change_class: requirement_reprice
- re_entry_point: runtime_governance
- first_missing_layer: execution-shape law over existing compute notation and plugin runtime boundaries
- triaged_at: 2026-05-22
- created_at: 2026-05-22
- updated_at: 2026-05-23
- governance_scope: STDO Method / ODD Method / GTL compute notation / ABG runtime / downstream SDLC plugin boundary
- governance_scope_expansion:
  - S: /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - T: /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - D: /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - O: /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - posting: /Users/jim/src/apps/specification_methodology/specification/standards/POSTING_GUIDE.md
  - writing: /Users/jim/src/apps/specification_methodology/specification/standards/WRITING_GUIDE.md
- priority: high
- source_comment:
  - .ai-workspace/comments/codex/20260522T162818Z_ANALYSIS_abg_probabilistic_monad_sdlc_composition.md
- depends_on:
  - T-116
  - T-134
  - T-141
  - T-143
- affected_boundary:
  specification:
    - specification/PRODUCT.md
    - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  design:
    - build_tenants/abiogenesis/typescript/design/README.md
    - build_tenants/abiogenesis/typescript/design/modules/
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts
  documentation:
    - docs/LLM_GTL_APP_BUILDER_GUIDE.md
    - docs/USER_GUIDE.md
    - README.md
  downstream_alignment_target:
    - /Users/jim/src/apps/odd_sdlc
    - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-180-align-sdlc-plugin-stages-with-abg-t144-boundary.md
- target_truth: ABG is the opinionated probabilistic eventual-consistency monad over selected GTL composition, with deterministic event-sourced execution as a valid reduction. Products supply strongly typed compute-stage plugins that compute transform/evaluate/consequence values. `F_H` is an external human-callout regime: ABG emits or admits the callout boundary, a TBD human-facing system surfaces the work, and ABG later admits the correct response event/carrier. ABG.system admits values, writes runtime truth, derives ledgers/projections/fold/traversal/replay, and invokes the next lawful stage.
- superseded_truth: ABG is only a generic deterministic event-sourced runner, or a downstream product can implement one local runtime plugin that performs transform, evaluation, ledger construction, assurance, consequence, continuation, and traversal inside one plugin call as long as it carries selected composition identity.
- closure_law: This ticket closes only when product law, requirements, design, TypeScript contracts, and tests make the staged monadic boundary explicit enough that downstream SDLC can implement `transform.C`, `evaluate.C`, and `consequence.C` as separate product plugin stages with ABG.system side effects between them.

## Problem

T-143 clarified compute notation as epistemology over existing GTL/ABG ontology.
It did not fully ratify the execution shape implied by that notation.

ABG can reduce to a purely deterministic event-sourced operation when selected
composition is fully `F_D`. That reduction is not the whole product model. ABG
is intentionally shaped for probabilistic eventual consistency: `F_D` and `F_P`
compute regimes participate through typed stage plugins, while `F_H` is an
external human-callout regime. ABG admits plugin outputs and human response
events/carriers, then replay/fold/continuation converge over admitted runtime
truth.

Therefore GTL must present strong category typing for the compute plugins. A
plugin slot must not be only an arbitrary callback. At minimum, the type surface
must make the plugin purpose visible:

```text
transform.C plugin -> candidate and evidence production
evaluate.C plugin -> evaluation finding production
consequence.C plugin -> product projection over ABG-admitted facts
```

The missing clarity is the monadic boundary:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(plugin.evaluate.C)
  .bind(system.admitEvaluation)
  .bind(system.writeEvaluationLedgers)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

Without this being explicit, downstream products can drift into treating one
plugin adapter as a local runtime. That collapse hides ABG bind points and
pushes product ambiguity into deterministic product code.

## STDO Governance Application

This ticket is governed by the full STDO stack. Each method adds a closure gate;
passing only one layer is not sufficient.

### S - SPEC_METHOD

This is a `requirement_reprice` at the runtime-governance boundary. The
constitutional surface must move before realization:

- product law must state ABG as the opinionated probabilistic
  eventual-consistency monad over selected composition, with deterministic
  event-sourced execution as a valid reduction;
- GTL requirements must preserve `function.compute` notation without adding a
  new topology object or execution carrier;
- ABG requirements must state where ABG.system admission, writes, ledgers,
  assurance fold, traversal, continuation, correction, and replay occur;
- downstream product requirements must remain product-owned interpretation over
  ABG-admitted facts, not generic ABG semantics;
- every new realization or test must trace back to product and requirement
  authority;
- no code behavior, plugin callback, prompt convention, or runtime artifact may
  become hidden product surface.

SPEC closure fails if implementation or docs claim the model while product and
requirement surfaces still permit a product-local runtime loop.

### T - TICKET_METHOD

This ticket is the durable work authority for the ABG/GTL alignment slice.

- The ticket remains active until the closure law and every acceptance criterion
  are satisfied.
- Comments, including the source monad post, are commentary only; they do not
  replace product, requirement, or design authority.
- Any downstream `odd_sdlc` implementation work must be named as a separate
  ticket and referenced from this ticket's closure note.
- Scope changes must amend this ticket rather than becoming chat-only or
  comment-only authority.
- Closure evidence must be recorded in the ticket with exact commands and
  reviewed residual risks.

TICKET closure fails if T-144 is closed as a discussion capture, a type-only
patch, or a downstream SDLC refactor without the ABG/GTL authority surfaces
moving first.

### D - DESIGN_MODULE_METHOD

The realization must preserve a bounded, inspectable module design.

- Design must name the IACS or equivalent carrier set for the staged
  ABG.system/plugin boundary.
- Stage outputs must be typed carriers or refs, not opaque callback payloads.
- Effect boundaries must isolate ABG.system writes from product plugin compute.
- The runner, plugin contracts, compute notation types, and admission/fold
  surfaces must have explicit ownership.
- Any selected-regime-binding or producer-regime proof must live in a typed
  carrier or deterministic assertion, not in prompt prose.
- Tests must prove the module boundary, not only happy-path execution.

DESIGN closure fails if one module still hides transform, evaluation, ledger
write, assurance fold, consequence, and continuation authority behind one local
adapter.

### O - ODD_METHOD

The model must remain ODD-correct over GTL/ABG.

- GTL graph functions remain the constructive carrier.
- ABG remains the traversal governance, runtime fact, provenance, continuation,
  and re-entry authority.
- Product plugins are bounded-step subsystems that compute typed values and
  return control to ABG.
- Product semantics, pressure maps, gain interpretation, and read-model meaning
  remain downstream product surfaces.
- Execution-authority audit is mandatory before closure because this ticket
  changes start/iterate/plugin/evaluation/continuation semantics.
- Negative proof must show there is exactly one execution authority for the
  affected traversal: ABG.

ODD closure fails if plugin or product code can choose next traversal, close a
boundary, write runtime events or ledgers, own replay, or continue a loop outside
ABG.

### Supporting Method Constraints

`POSTING_GUIDE.md` governs the source commentary post: it is analysis, not law.
Any reusable claim must be ratified into specification or design before it can
govern implementation.

`WRITING_GUIDE.md` governs wording: use direct authority language, separate
current reality from target direction, and cut explanatory text that adds no
constraint.

## Required Alignment

1. State in product law that ABG is the opinionated probabilistic
   eventual-consistency monad over selected GTL composition, with deterministic
   event-sourced execution as a valid reduction.
2. Keep `C` as notation over selected `abg.fn_composition`; do not introduce a
   new GTL or ABG public carrier.
3. Define `plugin.transform.C`, `plugin.evaluate.C`, and
   `plugin.consequence.C` as stage computations whose outputs remain proposed
   facts until ABG admission.
4. Define ABG.system side effects between stages:
   - graph call/frame opening
   - transform admission
   - transform event and payload-ledger writes
   - evaluation admission
   - evaluation ledger writes
   - assurance fold
   - consequence projection admission
   - traversal transition
   - replay continuation
5. Preserve the pure event-sourced `F_D` case: `C = F_D` remains a valid
   deterministic event-sourced system.

## Post-Review Completion Notes

T-145 completes the `evaluate.C` realization gap identified after T-144 review:
evaluation is now an evaluation-set phase over read-only admitted facts, with
scalar `FpEvaluationOutcome` treated as the one-rule F_P semantic judgment
reduction. ABG plans the evaluation set, invokes rule batches, admits rule
outcomes, writes evaluation payload/ledger events in stable order, and folds
assurance over the admitted evaluation-set projection.

T-146 captures the generalized Design Module Method follow-up: every composed
`.C` stage should converge through the same stage-set law. T-145 closes the
evaluation specialization; transform/consequence symmetry remains active under
T-146.
6. State the general ABG shape as probabilistic eventual consistency: `C` may
   include `F_P` and `F_H`, but ABG owns the bind points where probabilistic or
   human outputs become runtime truth.
7. Require GTL to expose strong category typing for compute plugins so the
   purpose of each plugin is visible before runtime binding:
   - `transform.C` plugin category
   - `evaluate.C` plugin category
   - `consequence.C` plugin category
   - producer regime and selected regime binding
   - input/output carrier refs
   - event/write/closure authority limits
8. Define downstream SDLC coding boundaries:
   - SDLC owns product plugin implementation and product semantic interpretation.
   - SDLC may compute candidate artifacts, semantic evaluation findings, product
     pressure rows, gain interpretation, and read-model refs.
   - SDLC must not own ABG event emission, payload ledger writes, assurance fold,
     traversal selection, continuation, correction, or replay truth.
   - ambiguous SDLC evaluation uses `evaluate.C` with an `F_P.evaluate` regime
     unless a selected deterministic optimization/disambiguation contract proves
     `F_D.evaluate` is lawful.
9. Define the `F_H` boundary:
   - `F_H` is external to ABG and GTL application runtime execution.
   - ABG may emit/escalate a human callout event or admit a human-callout
     request carrier.
   - A TBD human-facing system is responsible for surfacing the work to a human
     and collecting the human response.
   - ABG admits the response through the correct event/carrier and derives the
     next replay/fold/traversal state from admitted truth.
   - Any current `FhAdmissionPlugin` surface is a callout/response bridge under
     review, not the human doing the work inside ABG.

## Design Appendix From Source Comment

This appendix imports the target design from
`.ai-workspace/comments/codex/20260522T162818Z_ANALYSIS_abg_probabilistic_monad_sdlc_composition.md`.
It is target design for this ticket, not independent product law until the
product, requirement, design, and contract surfaces are updated.

### Design Claim

ABG is the opinionated probabilistic eventual-consistency monad over selected
GTL composition. A deterministic event-sourced runtime is a valid reduction of
that model when the selected composition is fully `F_D`; it is not the whole
model.

The reason ABG has three compute-stage plugin categories is to keep complex ODD
application logic outside ABG while still making the purpose and authority of
each plugin visible to GTL and enforceable by ABG.

### Stable Terms

- `fn<A, B>.C` is notation over a published `GraphFunction` bound by `Job`,
  optional realized `GraphVector` context, and selected `abg.fn_composition`
  identity.
- `C` is selected composition identity. It preserves composition ref, digest,
  host binding, declaration source, ordered regime bindings, policy/carrier/
  assurance context, and deterministic closure contract.
- `transform.C`, `evaluate.C`, and `consequence.C` are compute-stage functions
  under `C`.
- `F_D`, `F_P`, and `F_H` are regimes inside selected composition. They are not
  the primary stage prefix.
- `F_H` is external to the system. ABG may create or admit the callout boundary,
  but the human-facing work surface and human work happen outside ABG. ABG only
  regains authority when a correct response event/carrier is admitted.
- `plugin.*.C` is product-owned bounded compute.
- `system.*` is ABG-owned admission, event, ledger, fold, traversal, replay, and
  continuation truth.

### Target Bind Chain

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(plugin.evaluate.C)
  .bind(system.admitEvaluation)
  .bind(system.writeEvaluationLedgers)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

### Stage Contracts

```text
plugin.transform.C(
  input: A,
  selectedComposition: C,
  admittedContext: ABGReplayProjection
) -> TransformCandidateRefs

system.admitTransform(
  candidates: TransformCandidateRefs,
  selectedComposition: C
) -> RuntimeEventRefs + PayloadLedgerRefs

plugin.evaluate.C(
  admittedTransformState: ABGAdmittedState,
  selectedComposition: C
) -> EvaluationFindingRefs

system.admitEvaluation(
  findings: EvaluationFindingRefs,
  selectedComposition: C
) -> EvaluationLedgerRefs

system.assuranceFold(
  ledgers: ABGLedgerRefs,
  selectedComposition: C
) -> AssuranceClosureDecision

plugin.consequence.C(
  admittedEvaluationState: ABGAdmittedState,
  selectedComposition: C
) -> ProductProjectionRefs

system.admitConsequenceProjection(
  projections: ProductProjectionRefs,
  selectedComposition: C
) -> ConsequenceProjectionRefs

system.traversalTransition(
  closure: AssuranceClosureDecision,
  consequence: ConsequenceProjectionRefs
) -> AdvancementTransition

system.replayContinuation(
  transition: AdvancementTransition
) -> ReplayProjection
```

### Compute Reductions

```text
F_D-only composition:
  deterministic event-sourced system

F_P-backed composition:
  probabilistic event-sourced system

F_D -> F_P -> F_D composition:
  deterministic envelope,
  probabilistic semantic judgment,
  deterministic admission/fold boundary

F_D -> F_P -> F_H composition:
  deterministic envelope,
  probabilistic semantic judgment,
  external human callout and response admission under ABG traversal authority
```

Every reduction still follows the same ABG bind chain. A deterministic path may
make `transform.C`, `evaluate.C`, or `consequence.C` pure deterministic programs,
but it must not skip ABG admission, event writing, ledger projection, assurance
fold, traversal transition, or replay.

### F_H External Callout Boundary

`F_H` is a selected composition regime, not an internal ABG executor.

When traversal reaches `F_H`, ABG may:

- derive the lawful human-callout transition;
- emit or admit the human-callout event/carrier;
- expose enough refs for an external human-facing system to surface the work;
- later admit the human response event/carrier;
- fold, transition, continue, retry, block, reprice, or close from admitted
  response truth.

The TBD human-facing system owns the user interaction and collection of the
human response. It does not own ABG traversal, ledgers, assurance, replay, or
closure. The human response becomes ABG truth only through the admitted
event/carrier.

### Plugin Category Typing

GTL/ABG typed surfaces must distinguish these plugin purposes:

- `transform.C`: produces candidate artifacts, candidate refs, and evidence refs.
- `evaluate.C`: produces evaluation finding refs, gain/metric refs, residual
  pressure refs, continuation refs, evidence refs, authority refs, diagnostics,
  and proposed close disposition.
- `consequence.C`: produces product read-model projection refs over
  ABG-admitted facts.

Each category must expose:

- stage role: `transform`, `evaluate`, or `consequence`;
- selected composition ref/digest or causally linked selection ref;
- selected regime binding ref;
- producer regime: `F_D`, `F_P`, or `F_H`;
- input carrier refs and output carrier refs;
- predecessor/admission refs;
- authority limits: no plugin may write runtime events, write ledgers, select
  traversal, close a boundary, own continuation, or own replay.

### No-Hidden-Surface Invariants

- There is one execution authority: ABG.
- Product plugins compute values and return control.
- ABG.system admits values and writes truth.
- Human work is external. `F_H` callout adapters may surface or receive refs, but
  they do not perform human judgment inside ABG and they do not write runtime
  truth directly.
- Product ledgers and pressure maps are projections over ABG-admitted facts, not
  hidden plugin memory.
- F_P evaluation is a first-class `evaluate.C` regime binding when semantic
  ambiguity is unresolved.
- F_D evaluation is an optimization only when the selected composition carries a
  lawful deterministic/disambiguation contract.
- A local product adapter must never contain transform, evaluation, ledger
  construction, assurance fold, consequence projection, traversal transition,
  continuation, and replay as one hidden runtime loop.

## Non-Goals

- Do not rename GTL ontology.
- Do not introduce `ComputeUnit`, `ReliableCompute`, or another public carrier.
- Do not make ABG product-specific to SDLC.
- Do not implement the SDLC refactor in this ticket.
- Do not implement the TBD human-facing work surface in this ticket.
- Do not collapse ABG plugin stages into one product-local runtime callback.
- Do not let plugins write runtime events, ledgers, closure, traversal, replay,
  or continuation truth.

## Required Break Order

1. Amend product and requirement surfaces to state the event-sourced monad model.
2. Add design/IACS coverage for the staged ABG.system/plugin boundary.
3. Review the existing `EnginePluginContract`, `EnginePluginInput`, runner, and
   compute-notation types for missing stage-role or selected-regime-binding
   assertions.
4. Add or refine TypeScript contracts so plugin stage outputs can cite:
   selected composition identity, stage role, producer regime, selected regime
   binding, and admission predecessor refs.
5. Add deterministic tests that fail when a plugin-owned local runtime pretends
   to close, select traversal, write ledgers, or skip ABG admission between
   transform/evaluate/consequence stages.
6. Add downstream-facing documentation that tells SDLC where to place code:
   product plugin compute inside SDLC; ABG.system side effects inside ABG.
7. Record an explicit migration note for `odd_sdlc`: current one-call
   `fp_dispatch` implementation is a downstream refactor target, not ABG law.
8. Complete the STDO gates above in order: specification authority, ticket
   authority, design module authority, ODD execution-authority audit.

## Refactor And Review Checklist

The checklist is intentionally function-level where the current code already has
functions, and type-level where the current surface is only structural. Each row
must be classified as `refactor`, `review`, or `no change with proof` before
closure.

### GTL Compute Notation

- [x] Review
  `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts`
  `GtlStageRole`, `GtlTransformStage`, `GtlEvaluateStage`,
  `GtlConsequenceStage`, and `GtlEpistemicStageSet`: prove these are sufficient
  for strong plugin category typing or replace/extend them with explicit
  compute-plugin category carriers.
- [x] Review
  `GtlSelectedCompositionNotation`, `GtlCompositionRegimeBinding`,
  `GtlFdCompositionRegimeBinding`, and `GtlNonFdCompositionRegimeBinding`: prove
  selected-regime-binding identity is present for every stage output, not only
  composition-level declarations.
- [x] Review exported surface in
  `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/index.ts` so
  downstream products can consume the category types without importing private
  implementation names.

### ABG Plugin Contracts

- [x] Refactor/review `assertPluginKind`,
  `constructEnginePluginContract`, and `admitEnginePluginContract` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`:
  plugin contracts must expose stage role, producer regime, selected
  composition identity, selected regime binding, and authority limits.
- [x] Refactor/review `constructEnginePluginInput`: current logic derives
  plugin observer kind from regime (`F_P -> transform`, `F_D -> eval`) and has no
  `consequence` stage. The target surface must select stage category explicitly.
- [x] Refactor/review `constructFdEvaluationOutcome`,
  `admitFdEvaluationOutcome`, `constructFpDispatchOutcome`,
  `admitFpDispatchOutcome`, `constructFhAdmissionOutcome`, and
  `admitFhAdmissionOutcome`: outcome types must not collapse stage purpose,
  producer regime, and ABG admission result.
- [x] Refactor/review `FhAdmissionPlugin`, `FhAdmissionOutcome`,
  `defaultFhAdmissionPlugin`, and all `fh_admission` inventory rows: these must
  be callout/response bridge surfaces only, not internal human-work execution.
- [x] Review `deriveFdPressureRoutingDecision`: keep deterministic pressure
  routing as an optimization/helper, not as the generic `evaluate.C` model.
- [x] Refactor/review `enginePluginInventory`, `runtimeBindingStatusFor`, and
  `proofScopeFor`: inventory rows must report stage-category purpose and proof
  scope, not only old engine plugin kind families.
- [x] Review `defaultFdEvaluatorPlugin`, `defaultFpDispatchPlugin`, and
  `defaultFhAdmissionPlugin`: defaults must remain lawful reductions or become
  explicit default stage plugins.

### Plugin Traversal Observer And Hook Surfaces

- [x] Refactor/review `PLUGIN_TRAVERSAL_KIND_VALUES`,
  `PLUGIN_TRAVERSAL_OBSERVER_DECLARATION_KEYS`, and `assertTraversalKind` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugin_traversal_observer.ts`:
  current values are `transform` and `eval`; target stage categories are
  `transform`, `evaluate`, and `consequence`.
- [x] Refactor/review `hookBinding`, `fallbackBinding`,
  `admitAbgFallbackBundle`, `tryResolvePluginTraversalObserverBinding`, and
  `resolvePluginTraversalObserverBinding`: hook/default resolution must be
  stage-category aware and must preserve selected composition/binding refs.
- [x] Refactor/review `constructHookActionRecord`,
  `admitHookActionRecord`, `constructHookFindingAdmission`,
  `admitHookFindingAdmission`, and
  `assertHookFindingAdmissionMatchesAction` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/hook_actions.ts`:
  hook records must be usable as evidence of plugin-stage invocation and ABG
  finding admission without becoming runtime authority.

### ABG Runner Bind Chain

- [x] Refactor/review `resolveRunnerPlugins` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`:
  runner plugin resolution must map stage categories and selected regimes, not
  only `fdEvaluator`, `fpDispatch`, and `fhAdmission`.
- [x] Refactor/review `EnginePluginEffect`, `EnginePluginEffectResult`,
  `assertEnginePluginEffectKind`, `fdEvaluationOutcomeFromEffectResult`,
  `fpDispatchOutcomeFromEffectResult`, and `fhAdmissionOutcomeFromEffectResult`:
  effect algebra must represent `plugin.transform.C`, `plugin.evaluate.C`, and
  `plugin.consequence.C`.
- [x] Refactor `runEngineIterateMachine`: this is the main ABG monad surface.
  It must make the sequence explicit:
  `openGraphCall/openFrame -> transform.C -> admit/write transform ->
  evaluate.C -> admit/write evaluation -> assuranceFold -> consequence.C ->
  admit consequence -> traversalTransition -> replayContinuation`.
- [x] Review `appendEngineRunnerEvents`, `constructResult`, and
  `runtimeEventsForIterationDecision`: event emission must remain ABG.system
  owned and replay-derived.
- [x] Refactor/review `deriveFpDispatchAttemptInput`,
  `fpDispatchAttemptStartedEvents`, and `fdAuthorityOutcomeEvent`: current
  paths encode regime-specific dispatch/evaluation names and must not hide
  stage-category boundaries.
- [x] Refactor/review the `fh_escalation` branch in `runEngineIterateMachine`:
  it must model external callout and later response admission, not synchronous
  human work inside the ABG runner.
- [x] Refactor/review `resolveSyncEnginePluginEffect` and
  `resolveAsyncEnginePluginEffect`: sync/async paths must preserve the same
  admission and authority checks.
- [x] Review `runEngineIterate`, `runEngineIterateAsync`, `runEngineStart`, and
  `runEngineStartAsync`: public runtime entrypoints must remain
  `ABG.start -> ABG.iterate`, not product-local stage orchestration.

### F_P Transform, Evaluation, And Attached Result Path

- [x] Refactor/review `constructFpTransformRequest`,
  `constructFpTransformResult`, `admitFpTransformResult`,
  `admitFpTransformResultForRequest`, and `runtimeEventsForFpTransformResult`
  in `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_stages.ts`:
  F_P transform output must stay candidate/evidence production, and evaluation
  findings must move through `evaluate.C` rather than being inferred as closure.
- [x] Refactor/review `deriveAttachedFpResultDecision` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts`:
  this currently accepts, blocks, and plans retry from attached artifact
  assessment. It must be split or proven as an ABG.system admission/fold helper,
  not a hidden product runtime.
- [x] Refactor/review `evidenceCandidatesForArtifact`,
  `scopedTransformResult`, `blockedResultFromIngestOutcome`,
  `payloadEventsForAcceptedResult`, `retryDecisionForBlockedResult`, and
  `retryEventsForBlockedResult`: artifact ingestion must separate transform
  evidence, evaluation findings, ABG ledger writes, and retry/continuation
  derivation.

### ABG Admission, Ledgers, Assurance, And Traversal

- [x] Review `derivePayloadLedgerScope`, `derivePayloadLedgerProjection`,
  `deriveTargetCarrierAdmissionProjection`,
  `assertTargetCarrierAdmittedForClosure`,
  `deriveAssuranceAuthoritySnapshotFromPayloadLedger`, and
  `deriveAssuranceEvidenceRowsFromPayloadLedger` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/payload_ledger.ts`:
  payload/evaluation ledger derivation must stay ABG.system truth over admitted
  events.
- [x] Review `deriveAssuranceScopeRef`, `deriveAssuranceProjection`,
  `deriveAssuranceClosureDecision`, `deriveAssuranceReportReadModel`, and
  `admitAssuranceProviderOutput` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance.ts`:
  assurance remains the fold over admitted facts, not plugin-selected closure.
- [x] Review `scopeResultForProvider` and `evaluateAssuranceGate` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/assurance_gate.ts`:
  provider hooks may supply scoped facts, but ABG owns admission and fold.
- [x] Review `deriveIterationAdvanceDecision`,
  `deriveAdvancementTransition`, and `runtimeEventsForIterationDecision` in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration.ts`:
  traversal transition must happen after ABG.system fold and consequence
  admission.

### Runtime Events And Admission

- [x] Review/add runtime event carriers in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts`
  for plugin-stage invocation/admission if existing `plugin_traversal_*`,
  payload, evidence, and closure-input events cannot express the target chain.
- [x] Review `FhEscalationTransition`, `FhEscalatedRuntimeEvent`, and related
  admission rules: prove they are sufficient for external human callout, or add
  a properly typed human-response admission event/carrier.
- [x] Review/add event factories in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`,
  especially `constructPluginTraversalPromptMaterializedEvent`,
  `constructPayloadObservedEvent`, `constructPayloadValidatedEvent`,
  `constructEvidenceAdmittedEvent`, `constructAmbiguityObservationAdmittedEvent`,
  `constructClosureInputPublishedEvent`, and
  `constructFdAuthorityOutcomeAdmittedEvent`.
- [x] Review/add admission rules in
  `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts`,
  especially the `plugin_traversal_prompt_materialized`, payload/evidence,
  closure-input, and `fd_authority_outcome_admitted` rules.

### Test And Proof Surfaces

- [x] Add/extend deterministic tests proving stage-category typing rejects a
  plugin that claims runtime events, ledger writes, traversal selection,
  continuation, replay, or closure authority.
- [x] Add/extend tests proving `evaluate.C/F_P` can populate evaluation findings
  and pressure/evidence refs without becoming closure authority.
- [x] Add/extend tests proving `F_D.evaluate` is a lawful deterministic
  optimization only under selected composition/binding proof.
- [x] Add/extend tests proving `F_H` produces an external callout/response
  admission boundary and cannot execute human work, close traversal, or write
  ledgers inside ABG.
- [x] Add/extend runner tests proving the same ABG.system bind chain runs for
  `F_D`-only and `F_P`-backed compositions.
- [x] Add/extend snapshot or static tests proving installed/downstream guidance
  names `transform.C`, `evaluate.C`, `consequence.C`, and ABG.system side
  effects without legacy `F_P.transform`/`F_P.evaluate` prefix confusion.

## Acceptance Criteria

- [x] `PRODUCT.md` defines ABG as the opinionated probabilistic
  eventual-consistency monad over selected composition, with deterministic
  event-sourced execution as a valid reduction.
- [x] GTL compute notation requirements preserve `function.compute` syntax and
  clarify that stage functions are invoked by ABG, not by a product-local loop.
- [x] ABG fn-composition/runtime requirements state that ABG.system side effects
  occur between product plugin stages.
- [x] Plugin contracts or adjacent typed surfaces expose enough information for
  a product to assert stage role, selected composition, selected regime binding,
  and producer regime.
- [x] Tests prove non-`F_D` closure remains unrepresentable and plugin outputs
  cannot become ledger/traversal/replay truth without ABG admission.
- [x] Tests prove a deterministic `F_D`-only composition still follows the same
  event-sourced monadic chain.
- [x] Product and requirement surfaces explain that deterministic event-sourced
  execution is a reduction of the broader probabilistic eventual-consistency
  ABG model, not a replacement for it.
- [x] GTL/ABG typed surfaces expose strong compute-plugin categories for
  `transform.C`, `evaluate.C`, and `consequence.C`, including purpose, producer
  regime, selected regime binding, input/output carrier refs, and authority
  limits.
- [x] Tests or static checks prove an `F_P`-backed evaluate stage is distinct
  from deterministic postflight/admission.
- [x] Documentation gives SDLC an explicit coding boundary for `transform.C`,
  `evaluate.C`, `consequence.C`, and ABG.system writes.
- [x] Documentation states `F_H` is external human callout/response admission,
  not an internal compute plugin that performs human work.
- [x] Closure note names the downstream `odd_sdlc` follow-up/refactor ticket that
  must align the current `fp_dispatch` adapter to this model.
- [x] SPEC_METHOD gate passes: product and requirements authorize the model
  before runtime contracts or code claim closure.
- [x] TICKET_METHOD gate passes: ticket closure records exact evidence,
  residual risks, and downstream SDLC follow-up authority.
- [x] DESIGN_MODULE_METHOD gate passes: staged carriers, module ownership, and
  effect boundaries are explicit and tested.
- [x] ODD_METHOD gate passes: execution-authority audit proves ABG is the only
  traversal/runtime/continuation authority.

## Review Questions

- Does ABG need separate public plugin contracts for transform/evaluate/
  consequence, or can the existing plugin contract surface be extended with
  stage-role and selected-regime-binding proofs?
- Should GTL expose stage-specific plugin category types directly, or should ABG
  expose them as selected-composition binding projections consumed from GTL?
- Should `GtlEvaluationFindingRef` grow a selected-regime-binding ref, or should
  downstream products wrap it in stricter product carriers?
- Which assertions belong in generic ABG admission and which belong in the
  downstream SDLC plugin boundary?
- How much of the event-sourced monad framing belongs in GTL requirements versus
  ABG runtime requirements?

## Initial Proof Plan

- `npm run test:t143`
- `npm run build:semantic`
- `npm run lint:semantic`
- targeted plugin/runtime contract tests added by this ticket
- `git diff --check`

## Closure Evidence

Closed at: 2026-05-23

Specification and design surfaces updated:

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `build_tenants/abiogenesis/typescript/design/M03_ABG_PROBABILISTIC_MONAD_PLUGIN_BOUNDARY_DERIVATION.md`
- `docs/LLM_GTL_APP_BUILDER_GUIDE.md`
- `docs/USER_GUIDE.md`
- `README.md`

Realization surfaces updated:

- `gtl/m02/contracts/compute_notation.ts` exports
  `GtlComputePluginCategoryBinding` for transform/evaluate/consequence and
  external human-callout categories.
- `abg/m03/contracts/plugins.ts` adds compute-stage category, compute means,
  purpose, selected composition identity, selected regime binding ref, and
  `EngineComputeStageBinding` to engine plugin contracts/inputs.
- `abg/m03/contracts/plugin_traversal_observer.ts`,
  `abg.reference-fallbacks.json`, and CLI fallback parsing use
  `transform`/`evaluate`/`consequence`.
- `abg/m03/contracts/hook_actions.ts` and edge-assurance checks use the
  `evaluate` hook action class for evaluation-stage findings.

Initial deterministic proof:

- `npm run test:t144` passed: 4 tests.
- `npm run test:t143` passed: 1 test.
- `npm run test:t116` passed: 5 tests.
- `npm run test:t117` passed: 8 tests.
- `npm run test:t130:t131` passed: 20 tests.
- `npm run test:t132` passed: 1 test.
- `npm run test:t072:plugins` passed: 7 tests.
- `npm run test:semantic` passed: 606 tests.
- `npm run lint:semantic` passed.
- `git diff --check` passed.

## Post-Review Reopen And Remediation

Reopened at: 2026-05-23

An independent review correctly found that the first closure was incomplete:

- `selectedCompositionIdentity()` synthesized composition identity from local
  basis/job/vector data instead of consuming selected `abg.fn_composition`
  contract truth.
- `consequence.C` was typed but not runner-consumed as an executable product
  plugin stage.
- GTL category bindings still allowed impossible internal `F_H` compute roles
  for transform/evaluate/consequence.

Remediation completed:

- Added explicit `abg.fn_composition` declaration resolution in
  `abg/m03/contracts/fn_composition.ts`.
- `constructEnginePluginInput` now consumes selected composition contract
  ref/digest, selection ref, and selected regime binding ref from GTL
  declarations. Missing composition truth fails closed.
- Added exported declaration constructors so test, installed, and downstream
  scenarios can declare composition truth explicitly without ABG runtime
  fallback synthesis.
- Added runner-consumed `consequence_projection` plugin kind, default plugin,
  typed outcome/admission, runner effect execution, and blocking behavior.
- Tightened GTL compute category bindings so `F_H` is representable only as
  `human_callout`.
- Updated common fixtures, installed package proofs, CLI runtime binding, and
  edge-assurance installed scenarios to carry explicit selected composition
  truth.
- Preserved compose behavior by using one shared composition contract where a
  composed graph function merges multiple stage declarations.

Post-review deterministic proof:

- `npm run test:t072` passed: 14 tests.
- `npm run test:t116` passed: 5 tests.
- `npm run test:t131` passed: 14 tests.
- `npm run test:t132` passed: 1 test.
- `npm run test:t141` passed: 34 tests.
- `npm run test:t143` passed: 1 test.
- `npm run test:t144` passed: 6 tests.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed: 608 tests.

Downstream follow-up:

- Created `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-180-align-sdlc-plugin-stages-with-abg-t144-boundary.md`.

Residual boundary:

- ABG now exposes and tests the generic compute-stage category and admission
  authority boundary. ODD SDLC runtime migration remains in T-180 because SDLC
  owns product plugin implementation, product pressure/gain interpretation, and
  product read-model proof surfaces.

## Evaluate.C Composition Clarification

Clarified at: 2026-05-23

Downstream review of T-180 exposed a wording ambiguity in this ticket. The
intended T-144 model is not a new public runner plugin name such as
`F_P.evaluate` or `fpEvaluate`.

The stable model is GTL composition of plugin-stage categories:

```text
evaluate.C = compose(
  F_D validate/evidence register,
  F_P validate/judgment over admitted transform truth,
  F_H human_callout escalation when GTL composition requires it
)
```

`evaluate.C` is the compute-stage category. GTL composes the plugin-stage
categories and regime bindings. `abg.fn_composition` is the ABG-selected runtime
contract over that GTL composition: it preserves stage role, regime, role,
authority, input/output carrier refs, evidence refs, selected composition ref,
selected composition digest, and selected regime binding ref. `F_H` remains an
external human-callout boundary, not internal human work.

Runner plugin-kind names are implementation edges. They must not be treated as
the ontology. A product may not relabel `fp_dispatch` transform output as
evaluation truth. If a downstream product needs ambiguous evaluation, it must
declare the `evaluate/F_P` binding through GTL composition and let ABG select,
invoke, admit, ledger, fold, transition, and replay that composition. If the
runner cannot execute that selected binding, the defect is an ABG
runner/composition realization gap, not permission for a downstream product to
simulate ABG admission, ledgers, assurance fold, closure, traversal, or replay.

Additional composed-behavior proof:

- `T-144 evaluate.C plugins are composed through GTL regime bindings` proves
  `evaluate/F_D`, `evaluate/F_P`, and `human_callout/F_H` are separate ordered
  GTL-composed regime bindings selected by ABG at runtime.
- `T-144 GTL compose syntax keeps F_P transform dispatch distinct from evaluate.C`
  proves `fp_dispatch` remains `transform/F_P` and cannot be reclassified as
  `evaluate/F_P`.
- `T-144 GTL-composed evaluate.C rejects non-F_D closure and internal F_H
  evaluation` proves non-`F_D` closure and internal `F_H` evaluation fail closed.
- `T-144 downstream steel thread constructs GTL-composed C for ABG plugin stages`
  is the downstream consumer example. It constructs a GTL-composed graph function
  over three vectors, declares the selected composition/regime bindings, runs it
  through ABG, and observes:
  - vector 0: `transform/F_P` via `fp_dispatch`;
  - vector 0: `evaluate/F_P` via `fp_evaluator`;
  - vector 0: `consequence/F_D` via `consequence_projection`;
  - vector 1: `evaluate/F_D` via `fd_evaluator`;
  - vector 1: `consequence/F_D` via `consequence_projection`;
  - vector 2: `human_callout/F_H` via `fh_admission`.
- `T-144 downstream steel thread projects ABG ledgers for composed C` is the
  ledgered consumer example. It reuses the same steel-thread run and proves
  downstream consumers can derive the ledger/projection stack without writing
  hidden product ledgers:
  - runtime event ledger includes `basis_admitted`, `fp_dispatch_requested`,
    `payload_observed`, `payload_validated`, `authority_snapshot_admitted`,
    `evidence_admitted`, `ambiguity_observation_admitted`,
    `closure_input_published`, `fd_authority_outcome_admitted`, and
    `fh_escalated`;
  - payload ledger contains observed payload, validated payload, authority
    snapshots, ambiguity observation, closure input, and evidence rows;
  - assurance projection over the payload ledger derives fulfilled rows and
    closure decision `close`.

The downstream construction recipe proven by the steel thread is:

```text
GTL.compose(graphFunctionA, graphFunctionB, graphFunctionC)
  -> graph_function_declarations["abg.fn_composition"]
  -> ordered regime bindings
  -> ABG-selected composition ref/digest/selection ref
  -> EnginePluginInput.computeStageBinding
  -> product plugin stage invocation
  -> ABG-owned runtime event ledger
  -> ABG-derived payload/evidence ledger
  -> ABG-derived assurance projection/fold
  -> ABG-owned traversal/replay truth
```

Clarification proof:

- `npm run test:t144` passed: 11 tests.

## Post-Clarification Runner Realization

Reopened at: 2026-05-23

The clarification proof still over-relied on static composition and metadata.
It proved GTL could declare `evaluate.C/F_P`, but it did not prove the ABG
runner could execute that selected binding as an admitted stage.

Additional remediation completed:

- Added runner-consumed `fp_evaluator` plugin kind, default plugin, typed
  `FpEvaluationOutcome`, typed `FpEvaluationFinding`, and admission checks.
- Added `fp_evaluate` to the runner effect algebra and both sync/async effect
  resolution paths.
- The F_P transform path now runs the required ABG.system sequence:
  transform plugin return -> ABG transform admission/events -> `evaluate.C/F_P`
  plugin invocation -> ABG evaluation admission/events -> payload/evidence
  ledger projection -> assurance fold -> `consequence.C` plugin invocation.
- `FpEvaluationFinding` now fails closed when evidence refs or authority refs
  are absent, and preserves selected composition ref/digest plus the selected
  regime-binding contribution ref.
- Evaluation admission writes ABG-owned payload observed/validated, authority
  snapshot, evidence, ambiguity observation, and closure-input facts. Product
  plugins still cannot write ledgers, emit runtime events, select traversal, or
  close traversal.
- The steel thread now asserts actual runner invocation order:
  `fp_dispatch` (`transform/F_P`) -> `fp_evaluator` (`evaluate/F_P`) ->
  `consequence_projection` (`consequence/F_D`) -> `fd_evaluator`
  (`evaluate/F_D`) -> `consequence_projection` (`consequence/F_D`) ->
  `fh_admission` (`human_callout/F_H`).

Post-clarification deterministic proof:

- `npm run build:semantic` passed.
- `npm run test:t144` passed: 11 tests.
- `npm run test:t072` passed: 14 tests.
- `npm run test:t143` passed: 1 test.
- `npm run test:t141` passed: 34 tests.
- `npm run test:t116` passed: 5 tests.
- `npm run test:t130:t131` passed: 20 tests.
- `npm run test:t132` passed: 1 test.
- `npm run test:semantic` passed: 613 tests.
- `npm run lint:semantic` passed.
- `git diff --check` passed.

## Evaluation-Set Follow-Up

Captured at: 2026-05-23

T-144 proves the missing runner-consumed `evaluate.C/F_P` steel thread, but
`evaluate.C` is not ultimately a scalar evaluator call. The evaluation phase is
a rule-set phase over selected composition. It may contain many read-only
deterministic register builders, probabilistic semantic judgment rules, and
external human-callout rules.

The retained deterministic evaluation/register builders are intentional. They
create the register and ledger surface that prevents shallow evaluation and
early closure. Data-heavy products may need hundreds of `evaluate.C.F_D`
register rules before `evaluate.C.F_P` judges transform truth plus the admitted
register set.

The follow-up ticket is:

```text
.ai-workspace/tickets/active/T-145-realize-evaluate-c-as-evaluation-set-phase-over-read-only-ledgers.md
```

## Post-Review Hardening

Captured at: 2026-05-23

Code review found four remaining runner-boundary risks after `fp_evaluator`
was introduced. These were treated as T-144 hardening because they affect the
steel-thread correctness before the broader T-145 evaluation-set work:

- `FpEvaluationFinding` composition identity is now runner-validated against
  the selected ABG plugin input before ABG writes evaluation events. The runner
  rejects mismatched selected composition ref, selected composition digest, or
  selected regime-binding contribution ref.
- The shared proof library default composition now publishes
  `FpEvaluationOutcome` for `evaluate/F_P`. `FpEdgeAssuranceEvalFinding`
  remains available only for the edge-assurance hook/finding surface; it is not
  the default composition carrier for runner-consumed `evaluate.C/F_P`.
- `closeDisposition` now affects emitted evaluation ledger facts. `no_close`
  maps to non-closing partial evidence, `human_required` maps to deferred
  authority, and neither can silently close by being wrapped in an otherwise
  fulfilled outcome.
- The runner no longer installs the closing `defaultFpEvaluatorPlugin` when a
  product omits `fpEvaluator`. Missing product `fpEvaluator` resolves to a
  blocked evaluator and fails closed. Synthetic legacy tests that need the old
  closing behavior now install `defaultFpEvaluatorPlugin` explicitly.

Post-review deterministic proof:

- `npm run test:t144` passed: 14 tests.
- `npm run test:semantic` passed: 616 tests.
- `npm run lint:semantic` passed.
- `git diff --check` passed.
