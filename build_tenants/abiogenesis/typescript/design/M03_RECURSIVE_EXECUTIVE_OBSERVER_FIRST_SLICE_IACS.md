# M03 Recursive Executive Observer First-Slice IACS

**Status**: Ratified first slice
**Ticket**: T-160
**Date**: 2026-06-29

## Carrier Classification

| Surface | Classification | Owner | Reason |
| --- | --- | --- | --- |
| `GraphFunction.environment` | Existing prime carrier | GTL | Declares target workspace/work environment. |
| `Context.locator` / `Context.digest` | Existing prime carrier | GTL | Declares snapshot-bound workspace truth. |
| `AssetSurface.requiredContexts` | Existing subordinate declaration | GTL | Binds target assets to workspace context. |
| `FpEvaluationFinding` | Existing payload/finding carrier | ABG | Carries admitted F_P pressure findings. |
| `FpEvaluationOutcome` | Existing payload/finding carrier | ABG | Carries evaluated finding set. |
| `RequirementSpanLineageProjection` | Existing read-model projection | ABG | Supplies T-169 span identity across recursion/foldback/re-entry. |
| `ExecutiveObservationView` | Subordinate read-model projection | ABG | Immutable query over existing replay, workspace, evidence, pressure, continuation, and span-lineage refs. |
| `ExecutivePressureFactProjection` | Subordinate read-model projection | ABG | Projection over admitted F_P findings; no event write authority. |
| `ExecutiveContinuationInputProjection` | Subordinate read-model projection | ABG | Input projection for ABG continuation; not a controller. |

## Promotion Test

No new prime carrier is introduced.

The three new `Executive*` surfaces fail the prime-carrier promotion test
because they:

- are deterministic projections;
- are not event payload roots;
- are not GTL topology objects;
- are not writable ledgers;
- are not public work entrypoints;
- have no independent lifecycle outside replayed input truth.

## Authority Seams

| Seam | Required boundary |
| --- | --- |
| Workspace observation | Reads `Context` and replay refs; no mutation. |
| F_P executive output | Existing `evaluate.C` finding; no runtime authority fields. |
| Pressure classification | Deterministic projection over admitted finding refs. |
| Continuation | ABG continuation consumes projected pressure; F_P does not select action. |
| Downstream products | Consume read models; no local executive loop or span map. |

## Non-Closure Conditions

T-160 does not close if:

- observer truth is stored in a writable executive ledger;
- F_P finding carries event emission, ledger write, graph/frame mutation,
  traversal transition, continuation decision, or closure authority;
- product plugin code can bypass ABG payload/finding admission;
- continuation action is selected by worker prose;
- span identity is inferred from strings instead of consuming T-169
  `RequirementSpanLineageProjection`;
- `abg/executive` exposes worker invocation or event emitters as a downstream
  public surface.
