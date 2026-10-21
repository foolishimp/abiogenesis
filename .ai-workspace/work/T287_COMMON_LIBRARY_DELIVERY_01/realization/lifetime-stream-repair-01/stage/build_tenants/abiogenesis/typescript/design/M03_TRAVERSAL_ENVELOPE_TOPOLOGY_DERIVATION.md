# M03 Traversal Envelope Topology Derivation

**Status**: Active
**Date**: 2026-04-29
**Purpose**: Close T-086 by proving the generic traversal-envelope topology as
an ABG-owned replay/read-model shape over existing M03 runtime carriers.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`
- `specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`
- `M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`
- `M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md`
- `M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md`
- [T-086](../../../../.ai-workspace/tickets/active/T-086-prove-abg-generic-traversal-envelope-topology-for-cumulative-pressure-and-coverage.md)

## Decision

The generic traversal envelope exists in ABG, but it is not a new prime runtime
aggregate.

For the TypeScript M03 line, the envelope is a read-model and proof lens over:

- `ExecutionBasis`
- `RuntimeEvent`
- `RuntimeAggregateProjection`
- `IterationAdvanceDecision`
- `EnginePluginInput`
- `EnginePluginOutcome`
- `ResultArtifact`
- `ResultIngestOutcome`
- `AttachedFpResultDecision`
- `RetryRepairDecision`
- `LeafTaskEnvelope`

This preserves the existing ABG law: event truth is append-only,
projection is replay-derived, next-vector selection stays in
`IterationAdvanceDecision`, and retry/re-entry stays in ABG-owned events and
decisions. The envelope may be materialized for diagnostics, archive
projection, or downstream adapter proof, but it is not an alternate controller
state and not a public compute boundary.

## Envelope Shape

The generic envelope is the normalized view:

```text
TraversalEnvelopeView =
  execution basis
+ current aggregate projection
+ GTL vector declarations
+ admitted obligation or pressure refs
+ evaluator and plugin contracts
+ expected assessment refs
+ prior retry/gap/progress refs
+ actor and leaf-task refs
+ admitted result/evidence refs
+ output-binding refs when available
-> continue | retry | reprice | block | close
```

The current runtime already carries this shape through separate authoritative
families. T-086 therefore closes as a topology proof, not as an implementation
wave.

## Mapping To Current Carriers

| Envelope need | Current ABG carrier |
|---|---|
| graph function, graph, vector, job, policy, identity | `ExecutionBasis` |
| current projection | `RuntimeAggregateProjection` |
| open/planned/evaluated/closed vector state | `RuntimeAggregateProjection` |
| declared transition contract | GTL `GraphVector` declarations |
| evaluator and plugin contracts | `EnginePluginContract`, `EnginePluginInput` |
| worker/effect result | `EnginePluginOutcome` |
| result/evidence artifact | `ResultArtifact`, `ResultIngestOutcome` |
| attached worker admission decision | `AttachedFpResultDecision` |
| prior gap and retry truth | retry and progress `RuntimeEvent` variants plus `RetryRepairDecision` |
| actor progress and observed artifacts | supervised actor `RuntimeEvent` variants |
| subordinate bounded work | `LeafTaskEnvelope` and leaf-task event variants |
| output allocation/binding | deferred T-082 output-allocation refs |
| next action | `IterationAdvanceDecision`, retry decision, and assurance fold |

## T-082 Disposition

T-082 remains a downstream output-allocation ticket. The traversal envelope can
carry output-binding references when those facts exist, but T-086 does not need
T-082 to create a new aggregate or controller loop.

The topology decision is:

- ABG envelope projection consumes output-binding refs when output allocation
  is present.
- Missing output-allocation law remains a named downstream gap, not hidden
  success.
- T-090/T-091 assurance proof may classify missing output binding as
  `missing`, `partial`, or `deferred` according to the declared closure policy.

## Ownership Split

| Surface | Owner |
|---|---|
| graph/vector/function declaration | GTL |
| invocation identity and runtime basis | ABG |
| event admission and append-only truth | ABG |
| replay projection | ABG |
| next-vector selection | ABG |
| retry, continuation, actor, and leaf-task truth | ABG |
| plugin implementation effects | plugin provider |
| domain obligation construction | downstream domain |
| domain evidence meaning and gain function | downstream domain through ABG contracts |
| reports, archives, dashboards, adapter ledgers | read models |

## Proof Claim

Current TypeScript M03 design already proves the generic traversal envelope
topology:

1. `ExecutionBasis` binds graph, job, policy, runtime identity, and current
   invocation context.
2. `RuntimeEvent` is the only authoritative fact stream.
3. `RuntimeAggregateProjection` replays the stream into current traversal
   truth.
4. `EnginePluginInput` gives plugins current projection and expected
   assessment truth without granting closure authority.
5. `EnginePluginOutcome`, `ResultArtifact`, and `ResultIngestOutcome` carry
   effect results and evidence through admitted ABG boundaries.
6. Retry, continuation, actor, and leaf-task events preserve prior gap/progress
   evidence without erasing history.
7. `IterationAdvanceDecision` owns continue/converge selection.
8. `REQ-R-ABG3-ASSURANCE.md` adds the downstream closure fold that prevents
   the envelope from closing by nullable state or plugin claim.

No new prime carrier is required for T-086. T-090 designs the assurance
projection that consumes this envelope; T-091 proves the negative closure
guards.

## Non-Closure Conditions Preserved

- A downstream product cannot own next-vector selection.
- A plugin cannot emit runtime events, choose a vector, or close traversal.
- A worker claim without admitted result/evidence truth is not coverage.
- Prompt prose and IDs alone are not pressure truth.
- Reports and archives are read models, not runtime authority.
- Missing output allocation remains visible until T-082 or a lawful defer
  decision handles it.
