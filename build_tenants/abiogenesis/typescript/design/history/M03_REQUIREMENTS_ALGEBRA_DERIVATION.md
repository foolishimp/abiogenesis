# M03 Requirements Algebra Derivation

**Status**: Active
**Date**: 2026-06-26
**Purpose**: Design the T-162 first-slice ABG/GTL requirements algebra substrate.

## Source Authority

- `specification/GOALS.md` `GOAL-009`
- `specification/INTENT.md` `INT-001`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `.ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md`

## Re-Entry Decision

T-162 remains `product_reprice`.

`INTENT.md` already defines the controlling direction: GTL is the graph-native
language, ABG emits events and projects runtime truth, and traversal preserves
intent lineage by carrying `obligation_delta` instead of collapsing work to
scalar edge success. T-162 ratifies the missing product substrate under that
intent. It does not start `odd_glc`, replace the GTL/ABG intent boundary, or add
a new lifecycle ontology.

## Position

The requirements algebra is a projection substrate:

```text
RequirementEventPayload[*]
  -> RequirementLedger read model
  -> EdgeRequirementEnvironment
  -> RequirementProjection[*]
  -> RequirementEvidenceBinding[*]
  -> RequirementFoldProjection[*]
  -> RequirementResidualProjection[*]
  -> RequirementQueryReadModel
```

`RequirementLedger` is replay-derived. It is not a writable aggregate. Folds,
residuals, attenuation, and re-entry pressure are requirement-scoped
projections over existing ABG event truth, assurance fold truth, continuation
truth, and evaluate-next truth.

GTL declares requirement wrappers through existing language surfaces. ABG admits
payloads, replays events, builds projections, and exposes query. Product meaning
stays product-owned and enters through authored requirement terms, context
fragments, evidence refs, F_P findings, F_H decisions, or plugins.

## First-Slice Boundary

Implemented in this slice:

- requirement event payloads,
- stable requirement terms and typed relations,
- traversal spans over existing graph-function/vector identity,
- staged authority context fragments,
- destination-topology HOW constraints,
- edge requirement environments,
- active requirement and obligation projections,
- materialization and execution projection precedence,
- evidence binding and test-role classification,
- fold, residual, attenuation, and assurance-claim read models,
- deterministic F_D totality outcomes,
- first-slice completeness gates,
- query/read model,
- compatibility wrappers for existing obligation and residual refs.

Deferred unless later promoted:

- GUI/editor workflows,
- KAOS goal-model authoring surfaces,
- ReqIF/GRL/GSN/SACM/CAE import/export,
- odd_glc lifecycle policy,
- downstream odd_sdlc ledger deletion,
- rich goal/assumption/agent/operation/domain-object taxonomy beyond
  subordinate payloads required for first-slice tests.

## Module Decomposition

| Module | Boundary | Prime carriers |
| --- | --- | --- |
| `abg.requirements.events` | admitted requirement event payloads; only write-side truth for requirement algebra | `RequirementEventPayload` |
| `abg.requirements.carriers` | immutable requirement carriers and constructor helpers | `RequirementTerm`, `RequirementRelation`, `TraversalSpan`, `RequirementProjection` |
| `abg.requirements.admission` | ingress collapse and closed-world F_D outcome classification | `RequirementStructuralEvaluation` |
| `abg.requirements.environment` | edge-local requirement environment construction | `EdgeRequirementEnvironment` |
| `abg.requirements.projection` | active requirements, obligations, materialization targets, execution schedules | `RequirementProjection` |
| `abg.requirements.evidence` | evidence binding, evidence role classification, non-closing byproduct handling | `RequirementEvidenceBinding` |
| `abg.requirements.fold` | fold projection, residual projection, attenuation classification | `RequirementFoldProjection`, `RequirementResidualProjection` |
| `abg.requirements.assurance` | assurance-case read model over requirement fold/residual truth | `RequirementAssuranceClaim` |
| `abg.requirements.metrics` | deterministic first-slice completeness gates | `RequirementCompletenessReport` as read model |
| `abg.requirements.query` | query surface over replay-derived read models | `RequirementQueryReadModel` |
| `abg.requirements.compat` | retained compatibility wrappers | `RequirementProjection` |

These are realization modules beneath GTL/ABG graph functions. They do not own
traversal selection, target movement, closure, continuation, retry, or semantic
product meaning.

## Worked Trace

1. A GTL module declares requirement `REQ-DM-001`, a `TraversalSpan` over
   graph function `data_mapper.build` and vector `derive_validation`, a
   destination topology for `typescript/node`, and a test relation with
   `src/test` as a component-test source root.
2. ABG admits the declaration as requirement event payloads:
   `requirement_term_admitted`, `traversal_span_admitted`,
   `destination_topology_admitted`, and `requirement_test_relation_admitted`.
3. Replay derives `RequirementLedger` with the term, span, destination topology,
   and test relation. No writable ledger is updated.
4. `buildEdgeRequirementEnvironment` selects active requirements for the
   current graph-function/vector edge and carries compatible prior residuals.
5. `projectRequirements` emits an active obligation projection for
   `REQ-DM-001`.
6. `projectMaterializationTargets` selects the strongest active authority for
   the target path. A tenant-stack role policy outranks a matching design
   materialization target.
7. `projectExecutionSchedule` uses an admitted schedule command when present
   and does not fall back to a generic command for the same projection.
8. `bindRequirementEvidence` classifies a materialized `src/test/...` file as
   test-source evidence because the active test relation declares that root.
   Build byproducts bind as non-closing evidence unless admitted.
9. `foldRequirementEvidence` projects `partial` while test source exists but
   execution or semantic interpretation is still missing. It maps that state to
   existing ABG assurance/continuation truth and does not close the traversal.
10. `residualizeRequirementFolds` emits residual pressure over the same
    requirement/span.
11. `classifyRequirementAttenuation` marks the residual as `narrowed` when the
    remaining pressure moves from materialization to execution/interpretation.
12. `queryRequirements` answers which context fragments constrain the edge,
    which requirement terms span it, which obligations are active, which
    evidence bound, which folds remain partial, and which residual pressure
    remains.

## Fold And Residual Mapping

| Requirement projection state | Source ABG truth | Closure authority |
| --- | --- | --- |
| `satisfied` | Existing ABG assurance fold admits the scoped requirement projection as fulfilled under current authority. | May contribute to ABG close only through the existing assurance fold. |
| `partial` | Existing ABG assurance/continuation truth shows at least one scoped projection satisfied and at least one scoped projection open. | Non-closing; carries residual or continuation refs. |
| `blocked` | Existing ABG closure/evaluate-next truth selects block or blocked-prerequisite pressure. | Non-closing; ABG block/evaluate-next remains authoritative. |
| `deferred` | Existing ABG qualified-defer, yield, or continuation truth preserves pressure outside the current step. | Non-closing; ABG continuation remains authoritative. |
| `repriced` | Existing ABG or F_H-admitted reprice truth names the owning re-entry surface. | Non-closing; reprice surface remains authoritative. |
| `no_close_preserved` | Existing ABG assurance fold rejects closure while preserving admitted evidence/context. | Non-closing; residual pressure remains queryable. |

## F_D Totality

F_D receives only admitted requirement-algebra states. Unknown raw states fail
closed before F_D evaluation or are routed to typed F_P/F_H pressure.

Outcomes:

- `admitted_valid`
- `unknown_state_rejected`
- `rejected_malformed`
- `incomplete_structural_pressure`
- `stale_or_superseded`
- `contradictory_authority`
- `semantic_assessment_required`
- `semantic_residual_preserved`
- `human_decision_required`
- `non_closing_preserved`

No branch may return implicit success for an unrecognized state.

## Gap Partition

| Strategy gap | Slice classification | Decision |
| --- | --- | --- |
| span identity | slice-1-blocking | Use graph-function/vector identity plus frame, zoom, foldback, and alias refs. |
| fragment compression policy | first-slice-gate | Context fragments remain staged unless promotion policy admits a term. |
| requirement identity/versioning | slice-1-blocking | Stable ids, aliases, source refs, and digests are required. |
| refinement semantics | deferred-successor | First slice keeps refinement as typed relation payload; no full KAOS refinement engine. |
| projection ownership | slice-1-blocking | ABG projection owns requirement read models. |
| replay precedence | slice-1-blocking | Current admitted evidence supersedes stale/empty predecessor replay for same projection. |
| residual attenuation | slice-1-blocking | Classify unchanged/narrowed/transformed/moved/escalated/cleared. |
| edge-assurance bridge | first-slice-gate | Requirement folds map to existing assurance fold and continuation truth. |
| query surface | slice-1-blocking | Query must answer active edge requirement questions. |
| migration discipline | retained-compatibility | Existing obligation/residual refs become wrapped inputs only. |
| round-trip identity | deferred-successor | Preserve refs/digests now; ReqIF-style round trip later. |
| assurance-case projection | first-slice-gate | Read model only, no GSN/SACM authority. |
| obstacle/conflict analysis | deferred-successor | F_D checks only admitted structural rows; F_P owns plausibility. |
| operationalization boundary | deferred-successor | Keep operation/agent payloads subordinate unless IACS promotes. |

## Proof

The first-slice proof is `test_t162_requirements_algebra.test.mjs`.
It must validate the worked trace, F_D totality, closed-world admission,
fold/residual mapping, query output, and the six T-204-derived regression
patterns.
