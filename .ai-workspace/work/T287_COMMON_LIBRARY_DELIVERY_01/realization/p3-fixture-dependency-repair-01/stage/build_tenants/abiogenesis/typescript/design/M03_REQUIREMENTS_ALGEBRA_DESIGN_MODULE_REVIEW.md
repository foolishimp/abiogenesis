# M03 Requirements Algebra Design Module Review

**Status**: Passed For First-Slice Implementation
**Date**: 2026-06-26
**Purpose**: Apply `DESIGN_MODULE_METHOD.md` and ODD execution-authority review to T-162.

## Authority Seam Closure

Pass.

The design names one write-side truth: admitted requirement event payloads.
`RequirementLedger`, materialization projections, evidence bindings, fold
projections, residual projections, assurance claims, and query models are
read models. Existing obligation and residual refs may be retained only as
compatibility inputs wrapped into requirement projections.

## Essential Carrier Consolidation

Pass.

The IACS keeps ten prime carriers. `RequirementLedger`, `RequirementGraph`,
`RequirementGoal`, `RequirementAssumption`, `RequirementOperation`,
`DestinationTopology`, and `RequirementCompletenessReport` are not public prime
truth roots in the first slice.

## Enforcement After Proof

Pass.

Ingress first admits or rejects raw payloads into closed carrier variants.
Semantic kernels consume only admitted carriers and return typed projection or
F_D outcome values. TypeScript shapes enforce the admitted model after the
projection law is represented in tests.

## Ingress Collapse

Pass.

Open payloads stop at requirement event admission. After that boundary,
projection functions consume closed `RequirementEventPayload` variants and
immutable read models.

## Prime Law

Pass.

Each top-level carrier owns a distinct semantic, admission, projection, or
read-model boundary. Subordinate KAOS and interop concepts are not promoted
because they are useful vocabulary.

## Structural Carrier Diagram

Pass.

`M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` names prime carriers,
read models, effect edges, subordinate/deferred families, and fail-closed
edges.

## ODD Alignment

Pass.

The module does not hide a graph function or traversal controller. It is a
deterministic projection substrate beneath GTL/ABG graph functions. It does not
select traversal, move semantic targets, decide closure, dispatch workers, or
own product meaning.

## ODD Execution-Authority Audit

Pass.

| Authority | T-162 disposition |
| --- | --- |
| traversal selection | unchanged; existing ABG traversal law owns it |
| event emission | unchanged; existing ABG event law owns it |
| replay | requirements ledger is replay-derived |
| projection | T-162 adds deterministic projections over admitted truth |
| assurance fold | unchanged; requirement fold projections map to existing assurance fold |
| retry | unchanged; residuals do not dispatch retry |
| continuation | unchanged; residuals map to existing continuation truth |
| re-entry | unchanged; re-entry remains ABG/product repricing truth |

## Closure Risks

- If implementation admits a writable `RequirementLedger`, closure fails.
- If implementation lets requirement folds decide close/retry/reprice/block,
  closure fails.
- If implementation promotes rich KAOS families without IACS promotion tests,
  closure fails.
- If implementation classifies unknown syntax semantically in F_D, closure
  fails.

## Post-Route Surface Addendum

T-164, T-168, and T-169 add downstream route/read-model surfaces without
changing the T-162 prime carrier set.

The following realized public or package-visible shapes are subordinate query,
proof, or activation rows and are not prime carrier promotions:

| Shape | Classification |
| --- | --- |
| `RequirementLifecycleStateReadModel` | downstream read-only query output over replay-derived route truth |
| `RouteReplayFact` | proof/query replay row, not an event store |
| `RequirementRouteRuntimeContext` | ABG-runtime-internal activation context, not downstream input truth |
| `RequirementGraphPairProjection` | nested row inside `RequirementGraphProjection`, not a standalone graph carrier |
| `RequirementSpanLineageProjection` | read-only projection over `TraversalSpan` lineage refs |

Any future implementation that exposes these as writable ledgers, event
emitters, runtime controllers, or GTL-owned ABG runtime imports reopens the
design review.
