# M03 Total Assurance Projection Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md](./M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md), [M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md](./M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md), [M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md), [M03_M04_PLUGIN_CONTRACT_MODEL_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_M04_PLUGIN_CONTRACT_MODEL_STRUCTURAL_CARRIER_DIAGRAM.md), [T-090](../../../../.ai-workspace/tickets/active/T-090-design-abg-total-assurance-carriers-and-plugin-seams.md)

## Purpose

Render total assurance as a single ABG projection/fold over T-086 envelope
truth, GTL declarations, and typed provider contracts.

## Diagram

```mermaid
flowchart TD
  GTL[GTL GraphFunction / GraphVector assurance declarations]
  Policy[Resolved runtime / closure policy]
  Envelope[TraversalEnvelopeView]
  Events[Admitted RuntimeEvent ledger]
  HookRefs[Assurance hook refs + opaque config]

  ProviderContract[B-016 EnginePluginContract]
  AuthorityProvider[AuthoritySnapshotProvider]
  EvidenceAdapter[EvidenceAdapter]
  Classifier[AmbiguityClassifier]
  ClosurePolicy[ClosurePolicyProvider]
  GainAdapter[GainFunctionAdapter]

  Scope[AssuranceScopeRef]
  Snapshot[AssuranceAuthoritySnapshot]
  Evidence[AssuranceEvidenceRow]
  Rows[AssuranceAmbiguityRow]
  Projection[AssuranceProjection]
  Decision[AssuranceClosureDecision]

  Reports[Reports / archives / dashboards / adapter ledgers]
  Runner[M03 runner / release projection]

  GTL --> HookRefs
  GTL --> Scope
  Envelope --> Scope
  Envelope --> Evidence
  Events --> Evidence
  Policy --> ClosurePolicy

  HookRefs --> ProviderContract
  ProviderContract --> AuthorityProvider
  ProviderContract --> EvidenceAdapter
  ProviderContract --> Classifier
  ProviderContract --> ClosurePolicy
  ProviderContract --> GainAdapter

  AuthorityProvider --> Snapshot
  EvidenceAdapter --> Evidence
  GainAdapter --> Rows
  Snapshot --> Rows
  Evidence --> Rows
  Classifier --> Rows
  ClosurePolicy --> Decision

  Scope --> Projection
  Snapshot --> Projection
  Evidence --> Projection
  Rows --> Projection
  Projection --> Decision

  Projection --> Reports
  Decision --> Reports
  Decision --> Runner
```

## Reading Rules

- GTL declares hook refs and config; GTL does not own assurance semantics.
- Providers are B-016 plugin contracts; provider outputs are admitted inputs to
  ABG projection, not runtime truth.
- `AssuranceScopeRef` is derived from existing GraphCall/Frame/Continuation
  and vector truth.
- `AssuranceProjection` is the total row set over current authority and
  admitted evidence.
- `AssuranceClosureDecision` is the only assurance closure decision.
- Reports and ledgers consume projection/decision. They cannot close work.

## Target Architecture

```mermaid
sequenceDiagram
  participant Author as GTL author
  participant GTL as Published GTL module
  participant ABG as ABG M03 runtime
  participant P as Assurance providers
  participant R as Reports/adapters

  Author->>GTL: declare graph function/vector assurance hook refs
  GTL->>ABG: interpreted declarations and hook refs
  ABG->>ABG: derive TraversalEnvelopeView from events/projection
  ABG->>P: request authority snapshot, evidence adaptation, gain signal, policy
  P-->>ABG: provider outputs without event/vector/closure authority
  ABG->>ABG: project AssuranceAmbiguityRows
  ABG->>ABG: fold AssuranceClosureDecision
  ABG->>R: publish read-model projection and decision
```

## Sign-Off Claim

This design is lawful only if future code:

- derives scope from replay-visible runtime truth,
- computes or admits current authority/input digests,
- emits every applicable ambiguity status as an explicit row,
- invalidates stale prior closure projections on digest change,
- rejects provider outputs that attempt event emission, vector selection, or
  closure,
- treats reports as read models, and
- closes only through `AssuranceClosureDecision`.
