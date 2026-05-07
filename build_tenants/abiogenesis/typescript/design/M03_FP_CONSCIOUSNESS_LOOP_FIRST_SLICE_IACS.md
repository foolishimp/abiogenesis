# M03 F_P Consciousness Loop First Slice IACS

**Status**: Design candidate for `T-127`
**Date**: 2026-05-07
**Derived from**: [M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md](./M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md), [M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md](./M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md), [M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md](./M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md), [M03_TRAVERSAL_MODULATION_DERIVATION.md](./M03_TRAVERSAL_MODULATION_DERIVATION.md), [M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md](./M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md), [T-127](../../../../.ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md)

## Purpose

Declare the irreducible architectural carrier set for the first implementable
slice of the generic `F_P` construction consciousness loop.

The first slice proves the substrate contract. It does not claim full
downstream odd_sdlc repair parity or live agent closure.

## Irreducible Architectural Carrier Set

| Carrier | Owner | Role | Effect boundary |
|---|---|---|---|
| `ConstructionEpisodeRef` | ABG M03 | stable episode identity over one construction recurrence | none |
| `ConstructionObservationSnapshot` | ABG M03 projection | replay-derived linked asset/runtime/gap/action observation | none |
| `ObservationPressureRow` | ABG M03 projection | typed row for ledger, error, gap, workspace, temporal, F_H, or affect pressure | none |
| `TypedAssetGapProjection` | ABG M03/M04 read model | read-only public evaluator view over incomplete typed assets, blockers, candidate completion actions, highest-ranked asset/action, and ranking reasons | none |
| `ConstructionActionCatalogProjection` | ABG M03 projection | admissible graph/action rows from GTL, binding publication refs, and runtime eligibility | none |
| `ObservationToActionBindingProjection` | ABG M03 projection | maps pressure rows to lawful action catalog rows with match/missing-binding reasons | none |
| `ConstructionPriorityScheme` | GTL/product policy | visible configured priority axes and weights such as steel-thread or release-blocking | none |
| `AffectPriorityPolicy` | GTL/product policy | visible policy for interpreting admitted affect signals | none |
| `AffectPriorityAdjustment` | ABG M03 projection | replay-derived boost, attenuation, review, F_H, or escalation pressure over admitted affect signal plus visible policy | none |
| `ConstructionPriorityProjection` | ABG M03 projection | ranked evaluator input after configured priority and affect adjustment | none |
| `ConstructionEvaluatorInput` | ABG M03 plugin input | admitted input to the F_P evaluator plugin | plugin call |
| `ConstructionEvaluatorOutcome` | ABG M03 plugin outcome | ranked candidate set or terminal signal returned by plugin | plugin output admission |
| `ConstructionIntentCandidate` | product/F_P evaluator | proposed next construction action | event admission candidate |
| `ConstructionIntentAdmission` | ABG M03 | accept/reject row for one candidate | none |
| `AdmittedConstructionIntent` | ABG M03 | selected lawful next action | graph invocation |
| `ConstructionGraphActionInvocation` | ABG M03 | graph-call/frame/continuation-bound invocation plan | runner effect |
| `ConstructionProgressLedger` | ABG M03 projection | material progress/stagnation rows derived through RuntimeDerivedFluentRule truth | read model |
| `ConstructionProjection` | ABG M03/M04 projection | public episode status and next action | adapters only |
| `RuntimeEventCalculusAxiom` | ABG M03 Event Calculus | declared effects for construction events that change fluent truth | none |
| `RuntimeDerivedFluentRule` | ABG M03 Event Calculus | progress, stagnation, terminal, and public projection derivation | none |

## Code Ownership Plan

| Code surface | Responsibility |
|---|---|
| `code/src/abg/m03/contracts/fp_consciousness.ts` | single pure M03 construction surface for carriers, hook resolution, hook-config-to-priority policy admission, observation asset refs from runtime truth, action catalog rows, observation-to-action binding, priority/affect projection, candidate/admission types, runtime invocation event construction, progress rows, projection states, and summary agreement |
| `code/src/abg/m03/contracts/carriers.ts` | construction event interfaces in the runtime event union |
| `code/src/abg/m03/contracts/event_admission.ts` | event admission for construction event family |
| `code/src/abg/m03/contracts/event_calculus.ts` | construction Event Calculus effects and derived progress/public-state fluent rules |
| `code/src/abg/m03/contracts/projection.ts` and `retry_frontier.ts` | no-op or projection integration for the construction event family where the generic runtime fold encounters construction events |
| `code/src/app/m04/gaps/` | render read-only typed asset gap and construction projection without admitting policy, ranking locally, appending events, or dispatching next action |
| `code/src/cli/command.ts` | parse installed runtime binding and admit configured construction priority/affect carriers once before passing carrier truth to M04 |
| `test_env/tests/test_t127_fp_consciousness_loop_unit.test.mjs` | pure admission, hook, projection, and summary agreement tests |
| `test_env/tests/test_m04_public_gaps_projection_integration.test.mjs` | public gaps one-surface integration, installed CLI policy admission, and no-legacy-basis-fallback regressions |

## Hook Precedence Contract

```text
GraphVector.declarations["abg.fp_consciousness"]
  > GraphFunction.declarations["abg.fp_consciousness"]
  > Job.policy_hooks["abg.fp_consciousness"]
  > Role.policy_hooks["abg.fp_consciousness"]
  > Module.policy_hooks["abg.fp_consciousness"]
  > visible installed fallback
```

Tests must prove:

- each higher-precedence declaration wins
- absent declarations use the visible fallback
- malformed present declarations fail closed
- duplicate same-precedence declarations fail closed
- hook refs are preserved as declaration refs, not executed directly
- fallback identity and config digest are visible in the action catalog

## Admission Contract

Candidate admission tests must cover:

| Case | Expected result |
|---|---|
| valid same-edge repair candidate | admitted |
| valid graph-span reentry candidate | admitted |
| valid F_H gate candidate | admitted as terminal/input state |
| valid ticket/reprice candidate | admitted as terminal route |
| internal vector target with `RefinementBoundary` or `CandidateFamily` publication ref | admitted |
| candidate selected from an observation-to-action binding row | admitted |
| missing target outcome | rejected |
| action ref absent from catalog | rejected |
| candidate selected without observation-to-action binding | rejected |
| internal vector target without published traversal target ref | rejected |
| priority or affect adjustment without visible policy source | rejected |
| affect adjustment supplied directly by product/plugin output | rejected |
| terminal affect disposition paired with graph invocation dispatch | rejected |
| hidden runtime config | rejected |
| direct runtime event payload | rejected |
| graph function unavailable from GTL truth | rejected |
| source asset not in observation | rejected |
| F_D semantic canonicalization without source authority | rejected as F_D failure, converted to evaluator ambiguity pressure |

## Event Admission And Event Calculus Contract

The first slice admits:

| Event | Required lineage | EC role |
|---|---|---|
| `construction_episode_started` | run/work key, basis, episode, causation, correlation | initiates `ConstructionEpisodeOpen` |
| `construction_observation_snapshot_materialized` | episode, basis, projection, linked assets, authority digest | replay-aid snapshot; no fluent effect unless declared |
| `construction_action_catalog_projected` | episode, catalog, hook source refs, fallback digest, traversal publication refs | replay-aid snapshot; no fluent effect unless declared |
| `construction_evaluator_invoked` | episode, evaluator plugin ref, input digest | initiates `ConstructionEvaluatorAwaitingOutcome` |
| `construction_intent_candidate_returned` | episode, candidate set digest, evaluator outcome ref | terminates `ConstructionEvaluatorAwaitingOutcome` |
| `construction_intent_candidate_admitted` | episode, candidate, admission decision, authority refs | initiates `ConstructionIntentAdmitted(candidateId)` |
| `construction_intent_candidate_rejected` | episode, candidate, rejection reason, authority refs | no fluent effect by default; feeds derived rejection pressure |
| `construction_intent_selected` | episode, admitted intent, selection policy ref | initiates `ConstructionIntentSelected(intentId)` |
| `construction_graph_action_invoked` | episode, intent, graph call, frame, continuation, graph function/vector refs | initiates `ConstructionGraphActionInFlight(intentId)` |
| `construction_delta_observed` | episode, intent, asset/runtime delta refs | initiates `ConstructionDeltaAvailable(intentId)` and terminates action-in-flight |

Missing correlation, missing lineage, or mismatched authority digest is invalid
event truth.

The first slice does not admit `construction_stagnation_detected` as primary
runtime truth. Stagnation is derived by `RuntimeDerivedFluentRule` from
before/after projection refs, artifact digests, blocker identity, admitted
progress rows, F_H decisions, lawful reentry movement, and policy thresholds.
The public construction state is likewise projection truth, not an event that
can outrank replay.

Observation-to-action binding, configured priority ranking, and affect
adjustment are derived projection truth. They may feed evaluator input and
candidate admission, but they do not dispatch work or write runtime truth
directly.

## Projection Contract

The first slice projection states are closed:

```text
construction_closed
construction_progressing_yield
construction_blocked
construction_stalled
construction_review_required
construction_escalated
fh_input_required
ticket_created
reprice_required
```

Public summaries must render exactly one of those states and the same next
action refs as `ConstructionProjection`.

## Gaps Read Model Contract

Public gaps is a read-only evaluator projection over typed asset incompleteness
and construction observation pressure.

It may derive:

- incomplete typed asset refs and asset kinds
- required-by refs and open obligation refs
- missing input, output, proof, or publication truth refs
- blocking reason refs
- eligible completion or induction action refs
- best graph function, graph vector, or terminal route refs when available
- admission blocker refs
- priority rank, value pressure, and ranking reason refs
- the highest-ranked asset/action preview from the same evaluator ranking surface

It may not:

- append construction events
- admit construction intent
- select or dispatch graph work
- retry privately
- publish next-action truth outside `ConstructionProjection`

Bootstrap uses the same contract. Sparse replay state may make asset induction
the highest-value or blocking recommendation, but the induction path must be a
published graph function or lawful action catalog row and must pass ABG
construction-intent admission before invocation.

## Progress Contract

Positive progress tests:

- artifact digest changed
- typed progress row fulfilled an obligation
- blocker narrowed
- graph-span reentry moved
- F_H decision accepted
- ticket/reprice terminal route created

Negative progress tests:

- same artifact digest and same blocker
- retry produced no artifact/report/progress row
- candidate repeated after rejection with no new authority
- F_D required canonical semantic identity without source disambiguation
- public summary invented progress absent from the ledger
- primary `construction_stagnation_detected` event attempted without
  derived-fluent rule

## Priority And Affect Contract

Positive tests:

- an open ledger obligation binds to a graph function that provides the target
  outcome and whose required inputs are present
- a compile/test error binds to a repair action only when the affected asset and
  evidence refs match the action inputs
- steel-thread priority ranks a vertical slice above full-breadth when both
  actions are lawful
- release-blocking priority ranks a blocker repair above unrelated progress
- danger/fear affect can boost review or escalation pressure through an
  ABG-derived `AffectPriorityAdjustment`
- low confidence affect can attenuate an otherwise lower-value speculative
  action
- terminal affect disposition blocks invocation even when a lawful graph action
  exists
- equal final scores produce stable `rankOrdinal` by target outcome, action,
  binding, and policy refs

Negative tests:

- affect cannot make an unpublished vector target admissible
- affect-only pressure cannot bind directly to constructive graph actions
- priority cannot override missing input bindings
- steel-thread label cannot hardcode traversal semantics in ABG
- hidden priority config or affect config fails closed
- product/plugin-emitted `AffectPriorityAdjustment` fails closed

## Runner Contract

The runner consumes `AdmittedConstructionIntent`.

It may:

- create graph-call/frame/continuation-bound invocation plans
- append admitted construction events
- dispatch selected graph action through existing plugin/transport law
- project progress and terminal state from admitted events

It may not:

- rank product outcomes
- switch on downstream domain strategy labels
- publish public next action outside `ConstructionProjection`
- retry privately after a terminal/stalled projection
- treat worker prose as progress without admitted progress rows

## Test Lanes

| Script | Required proof |
|---|---|
| `npm run test:t127` | pure carriers, hook precedence, candidate admission, progress/stagnation, projection summary agreement, read-only typed asset gaps, typed-asset-to-action binding, read-only evaluator ranking, no-mutation gaps behavior, and bootstrap asset-induction admission contract |
| `npm run test:t106` | no-progress continuation remains authoritative for no-output actor facts |
| `npm run test:t107` | traversal modulation envelope remains authoritative for bounded attempts |
| `npm run test:semantic` | broader semantic suite remains green |
| sandbox/live-equivalent lane | downstream adapter observes typed construction progress and does not own a loop |

## Non-Closure Conditions

Do not close the first slice if:

- code creates another local action-selection loop
- public summaries can disagree with construction projection
- hook resolution has hidden fallback behavior
- malformed candidates are silently repaired
- progress can be inferred from prose or elapsed time
- F_D can fail undisambiguated product meaning
- graph invocation bypasses graph-call/frame/continuation lineage
