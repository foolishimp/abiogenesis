# M03 Payload Ledger Event Topology First Slice IACS

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md](./M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md), [M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md](./M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md), [T-095](../../../../.ai-workspace/tickets/active/T-095-define-event-sourced-abg-payload-ledger-and-legal-proof-topology.md)

## Purpose

Declare the irreducible carrier inventory for an event-sourced ABG payload
ledger before tenant implementation begins.

## Boundary

This slice is:

- `M03-engine-kernel` event and projection law,
- scoped to existing `GraphCall`, `Frame`, `Continuation`, and vector-local
  truth,
- upstream of assurance row projection,
- upstream of downstream lifecycle registers,
- compatible with external payload bodies by ref and digest.

This slice is not:

- a product-specific lifecycle ledger,
- a mutable store,
- a new runtime aggregate,
- a plugin-owned closure channel,
- a GTL payload DSL.

## Prime Carrier Set

| Carrier | Role | Authority |
| --- | --- | --- |
| `PayloadEnvelope` | canonical runtime identity for an external or inline payload | ABG admission |
| `PayloadObservation` | source fact that payload was observed at a runtime boundary | ABG event |
| `PayloadValidation` | source fact or deterministic result for accepted/rejected payload contract state | ABG event/projection |
| `AuthoritySnapshotAdmission` | current authority/input identity for a scope | ABG event |
| `EvidenceAdmission` | candidate proof fact bound to payload, authority, input, and scope | ABG event |
| `AmbiguityObservationAdmission` | admitted ambiguity or gap fact relevant to assurance | ABG event |
| `ClosureInputPublication` | publication of source facts to assurance fold | ABG event/projection |
| `PayloadLedgerProjection` | read model over payload source facts | projection only |
| `AuthorityLedgerProjection` | read model over authority snapshots | projection only |
| `EvidenceLedgerProjection` | read model over evidence admissions | projection only |
| `ClosureInputProjection` | ABG read model exposing admitted closure inputs to assurance fold | projection only |

## Subordinate Payloads

| Shape | Status | Admission rule |
| --- | --- | --- |
| payload body | external or inline artifact | referenced by envelope and digest |
| worker stdout/stderr | observed transport evidence | admissible as payload body refs, not domain truth by itself |
| report markdown | downstream payload body | closure relevance only through admitted evidence |
| test output | evidence payload | bound to authority/input and proof shape before fulfillment |
| prompt text | dispatch payload | digest-bound observation; not proof by itself |
| private worker reasoning | excluded | not constitutional runtime truth |

## Authority And Role Matrix

| Carrier | Owning module | Ingress boundary | Downstream consumers |
| --- | --- | --- | --- |
| `PayloadEnvelope` | M03 engine kernel | command admission | payload ledger, evidence adapters, reports |
| `PayloadObservation` | M03 event law | actor/transport/result observation | payload ledger |
| `PayloadValidation` | M03 event/projection law | codec/admission validation | assurance and failure classification |
| `AuthoritySnapshotAdmission` | M03 assurance support | GTL declarations and provider output | assurance projection, stale-input detection |
| `EvidenceAdmission` | M03 assurance support | admitted payload plus evidence adapter | assurance projection |
| `AmbiguityObservationAdmission` | M03 assurance support | provider/runtime observation | ambiguity rows, closure fold |
| `PayloadLedgerProjection` | M03 projection law | replay | reports, downstream adapters |
| `ClosureInputProjection` | M03 projection law | replay over ABG source facts | assurance fold, downstream adapters |
| downstream lifecycle register | downstream adapter profile | replay over ABG projections | product-specific analysis only |

## Event Source Rules

- `emit()` remains the only write path.
- Payload observations and admissions append source facts.
- Projection outputs are read models.
- Snapshot or audit-marker events may assist replay but cannot outrank source
  payload facts.
- Same-edge retry preserves prior source facts and computes a fresh projection.

## CQRS Rules

| Layer | May write? | Example |
| --- | --- | --- |
| command | no | `admit_payload_observed(...)` |
| event | yes, through `emit()` only | `PayloadObserved` |
| projection | no | `PayloadLedgerProjection` |
| report/register | no | lifecycle register, release summary |
| plugin | no authoritative write | provider proposal only |

## Fail-Closed Rules

- Missing payload envelope yields invalid or missing payload status.
- Malformed payload yields rejection.
- Unknown schema or contract yields rejection or partial evidence.
- Evidence without authority binding yields `orphan_evidence` or `partial`.
- Authority/input digest mismatch yields `stale_input`.
- Plugin closure claim is ignored as closure and admitted only as evidence or
  ambiguity when lawful.
- Mutable local ledger state cannot close work.

## Proof Map

| Proof lane | Design source | Required assertion |
| --- | --- | --- |
| payload source admission | this IACS | payload observation produces source fact |
| projection determinism | this IACS and projection requirement | same events produce same ledger |
| shadow ledger rejection | this IACS and payload requirement | mutable ledger cannot close |
| plugin authority limit | this IACS and assurance IACS | plugin cannot emit event or closure |
| stale input | assurance and payload requirements | digest change invalidates prior closure projection |
| two-hop deepening | T-094 and scenario 11 | second missing evidence row stops convergence |
| live Claude payload path | scenario 11 | worker output is observed and admitted before closure relevance |

## Downstream Read Models

Lifecycle registers and gain reports are downstream read models over ABG
projections. ABG must expose enough generic payload, authority, evidence,
ambiguity, and closure-input facts for those read models to be built, but ABG
does not own their domain semantics or release interpretation.
