# M03 Total Assurance Projection First Slice IACS

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md](./M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md), [M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md](./M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md), [M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md](./M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md), [T-090](../../../../.ai-workspace/tickets/active/T-090-design-abg-total-assurance-carriers-and-plugin-seams.md)

## Purpose

Declare the irreducible TypeScript ABG carrier inventory for total assurance
projection and closure fold before tenant implementation opens.

The design goal is totality: every relevant authority/evidence state becomes a
named row, and closure is derived only from the fold over those rows.

## Boundary

This slice is:

- `M03-engine-kernel` assurance law,
- replay-derived over admitted runtime truth,
- driven by GTL-declared assurance hook refs and resolved provider contracts,
- upstream of tenant implementation and proof tickets,
- consumable by reports as read-model truth.

This slice does **not** include:

- downstream domain requirement semantics,
- odd_sdlc-specific trace rules,
- Python or TypeScript tenant code implementation,
- a public `UnitOfCompute` aggregate,
- plugin-owned closure.

## Irreducible Architectural Carrier Set

This slice introduces six prime assurance carrier families:

1. `AssuranceScopeRef`
2. `AssuranceAuthoritySnapshot`
3. `AssuranceEvidenceRow`
4. `AssuranceAmbiguityRow`
5. `AssuranceProjection`
6. `AssuranceClosureDecision`

`AssuranceScopeRef` is prime inside the assurance model because all assurance
rows need a stable scope identity. It is still derived from existing
GraphCall/Frame/Continuation/vector truth and is not a new product aggregate.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
|---|---|---|---|---|---|
| `TraversalEnvelopeView` | `M03-engine-kernel` | scoped runtime basis | replay/read-model derivation | none | assurance projection |
| `AssuranceScopeRef` | `M03-engine-kernel` | identity for one assurance scope | derived from envelope truth | none | rows, projection, decision |
| `AssuranceAuthoritySnapshot` | `M03-engine-kernel` | current authority/input snapshot | GTL declarations and provider output admission | none | evidence adaptation, classifier, projection |
| `AssuranceEvidenceRow` | `M03-engine-kernel` | normalized evidence candidate | event replay and evidence adapter output admission | none | classifier, projection |
| `AssuranceAmbiguityRow` | `M03-engine-kernel` | explicit authority/evidence status | classifier output admitted through ABG rules | none | projection, closure fold, reports |
| `AssuranceProjection` | `M03-engine-kernel` | total row set plus provenance | deterministic projection | none | closure fold, reports, adapters |
| `AssuranceClosureDecision` | `M03-engine-kernel` | only closure/retry/reprice/block/defer decision | fold over projection and policy | runtime transition planning | runner, release projection, reports |
| `AuthoritySnapshotProvider` | plugin contract | provides authority/input snapshot data | B-016 provider resolution | provider call | assurance projection |
| `EvidenceAdapter` | plugin contract | maps admitted facts to evidence candidates | B-016 provider resolution | adapter call | assurance projection |
| `AmbiguityClassifier` | plugin contract | proposes row classification | B-016 provider resolution | classifier call | assurance projection |
| `ClosurePolicyProvider` | plugin contract | provides closure/retry/reprice/defer policy | B-016 provider resolution | provider call | closure fold |
| `GainFunctionAdapter` | plugin contract | provides domain gain signal | B-016 provider resolution | adapter call | classifier/projection |

## Assurance Provider Seam Inventory

| Seam | Classification | Binding status | Engine-owned law | Provider-owned implementation scope | Required proof |
|---|---|---|---|---|---|
| authority snapshot | `Provider` | assurance-consumed | snapshot admission and digest binding | locate/describe current authority and inputs | missing/stale/contradictory authority rows emitted |
| evidence adaptation | `Provider` | assurance-consumed | evidence row admission and scope binding | map admitted facts to candidate evidence | orphan/missing/partial rows emitted |
| ambiguity classification | `Provider` | assurance-consumed | row vocabulary, totality, precedence | domain-aware status proposal | unknown/malformed proposal fails closed |
| closure policy | `Provider` | assurance-consumed | fold vocabulary and final decision | policy values for retry/reprice/defer | plugin cannot directly close |
| gain function | `Provider` | assurance-consumed | gain signal admission and row binding | domain score/measure/interpretation | bad gain produces visible ambiguity |
| report consumer | `ProjectionConsumer` | read-model-consumed | projection remains source truth | render/filter/export rows | report cannot close work |
| GTL assurance hook ref | `DeclarationRef` | declarative-contract | hook ref interpretation and resolution | published hook identity/config | hook ref cannot execute directly |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
|---|---|---|---|
| `AuthorityDigest` | subordinate | identity payload under authority snapshot | deterministic over current authority/input snapshot |
| `InputDigest` | subordinate | input identity under authority snapshot | deterministic or admitted equivalent |
| `AssuranceHookRef` | subordinate | GTL declaration ref | must resolve through B-016 provider model |
| `EvidenceBindingRef` | subordinate | evidence pointer under row | must point to admitted event/artifact/provider output |
| `RowReasonCode` | subordinate | explanatory payload under ambiguity row | closed vocabulary or provider-specific namespaced code |
| `ClosureBlockReason` | subordinate | decision detail | derived from row statuses and policy |
| `QualifiedDeferJustification` | subordinate | release/closure policy detail | permitted only by closure policy and row facts |
| `GainSignal` | subordinate | domain measure | cannot itself mark fulfillment |

## Row Status Register

| Status | Closure effect |
|---|---|
| `fulfilled` | can close only if all required rows are fulfilled or lawfully deferred |
| `partial` | cannot close; retry/reprice/block by policy |
| `missing` | cannot close; retry/reprice/block by policy |
| `stale_input` | invalidates prior projection; cannot close |
| `authority_missing` | reprice or qualified defer by policy |
| `orphan_evidence` | cannot satisfy authority; blocks unless unrelated or independently fulfilled |
| `contradictory_authority` | reprice |
| `contradictory_evidence` | block or retry by policy |
| `deferred` | may qualify defer only if policy permits |
| `event_ledger_invalid` | block |

## Collapse Decisions

- Assurance does not introduce `UnitOfCompute`.
- Assurance scope is derived from existing runtime aggregates and event ids.
- GTL hook refs are declarations, not callbacks.
- Providers supply typed data and proposals; ABG owns projection and fold.
- Reports and ledgers are read models over `AssuranceProjection`.
- Old closure paths are evidence candidates only.

## Module-Derived Proof Map

| Proof lane | Design source | Required assertion |
|---|---|---|
| row totality | assurance requirement and this IACS | every required status can be emitted |
| fold determinism | this IACS | one projection produces exactly one decision |
| stale-input invalidation | assurance requirement | changed authority/input digest invalidates prior closure projection |
| plugin authority limit | plugin IACS and this IACS | provider cannot emit events, choose vector, or close |
| GTL hook completeness | GTL hook requirements | graph function/vector can declare assurance hook refs without side-door config |
| report read-model limit | this IACS | report cannot replace projection or decision |
| envelope conformance | T-086 IACS | assurance scope derives from `TraversalEnvelopeView` |

## Fail-Closed Rules

- Missing authority snapshot yields `authority_missing`.
- Unreadable or invalid event truth yields `event_ledger_invalid`.
- Evidence outside the current scope yields `orphan_evidence`.
- Evidence without required binding yields `partial` or `orphan_evidence`.
- Changed authority/input digest yields `stale_input`.
- Unknown classifier status fails closed.
- Provider output that includes runtime events, next-vector choice, or closure
  claim fails closed.
- `close` cannot be emitted while any required row is not fulfilled or
  lawfully deferred.
